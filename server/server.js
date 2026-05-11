const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { OAuth2Client } = require('google-auth-library');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-dersa-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'G_CLIENT_ID_BURAYA_GELECEK';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// DEV ONLY: Seed test accounts and teacher code
async function seedAccounts() {
    const code = 'DERSA-2026';
    const codeExists = await prisma.teacherCode.findUnique({ where: { code } });
    if (!codeExists) await prisma.teacherCode.create({ data: { code } });

    const dummyPassword = await bcrypt.hash('123456', 10);

    const teacherExists = await prisma.user.findUnique({ where: { email: 'ogretmen@dersa.com' } });
    if (!teacherExists) {
        await prisma.user.create({ data: { name: 'Demo Öğretmen', email: 'ogretmen@dersa.com', password: dummyPassword, role: 'TEACHER' } });
    }

    const studentExists = await prisma.user.findUnique({ where: { email: 'ogrenci@dersa.com' } });
    if (!studentExists) {
        await prisma.user.create({ data: { name: 'Demo Öğrenci', email: 'ogrenci@dersa.com', password: dummyPassword, role: 'STUDENT' } });
    }
}
seedAccounts();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role, teacherCode } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Tüm alanları doldurun.' });
        }

        if (role === 'TEACHER') {
            if (!teacherCode) {
                return res.status(400).json({ error: 'Öğretmen kaydı için geçerli bir davet kodu gereklidir.' });
            }

            const codeRecord = await prisma.teacherCode.findUnique({ where: { code: teacherCode } });
            if (!codeRecord) return res.status(400).json({ error: 'Geçersiz öğretmen davet kodu.' });
            if (codeRecord.isUsed) return res.status(400).json({ error: 'Bu davet kodu zaten kullanılmış.' });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Bu e-posta zaten kullanımda.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role }
        });

        if (role === 'TEACHER') {
            await prisma.teacherCode.update({
                where: { code: teacherCode },
                data: { isUsed: true, usedBy: user.id }
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Kayıt sırasında hata oluştu.' });
    }
});

app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential, role } = req.body;
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();

        if (!payload.email) return res.status(400).json({ error: 'Google hesabı e-posta içermiyor.' });

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email: payload.email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: payload.email,
                    name: payload.name,
                    role: role || 'STUDENT',
                    googleId: payload.sub,
                    avatar: payload.picture
                }
            });
        } else if (!user.googleId) {
            user = await prisma.user.update({
                where: { email: payload.email },
                data: { googleId: payload.sub, avatar: payload.picture }
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Google girişi başarısız veya geçersiz token.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Kullanıcı bulunamadı.' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Hatalı şifre.' });

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
    } catch (error) {
        res.status(500).json({ error: 'Giriş sırasında hata oluştu.' });
    }
});

// Update Profile Avatar
app.put('/api/user/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Oturum kapatıldı, giriş yapın.' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const { avatar } = req.body; // Base64 image payload

        const updatedUser = await prisma.user.update({
            where: { id: decoded.id },
            data: { avatar }
        });

        res.json({ success: true, user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, avatar: updatedUser.avatar } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Fotoğraf güncellenirken bir hata oluştu.' });
    }
});

// ==========================================
// BLOG ECOSYSTEM ENDPOINTS (V11)
// ==========================================

// Get all posts (or filtered)
app.get('/api/blog', async (req, res) => {
    try {
        const { sort } = req.query; // e.g. 'popular'
        let orderBy = { createdAt: 'desc' };
        if (sort === 'popular') orderBy = { views: 'desc' };

        const posts = await prisma.post.findMany({
            orderBy,
            include: {
                _count: { select: { comments: true } }
            }
        });

        // We'll attach the author names by fetching users
        // In a real app we'd make a relation, but for MVP we mapped authorId manually
        const authorIds = [...new Set(posts.map(p => p.authorId))];
        const authors = await prisma.user.findMany({
            where: { id: { in: authorIds } },
            select: { id: true, name: true, avatar: true }
        });

        const authorMap = {};
        authors.forEach(a => authorMap[a.id] = a);

        const mappedPosts = posts.map(p => ({
            ...p,
            author: authorMap[p.authorId] || { name: 'Dersa Eğitmeni' }
        }));

        res.json(mappedPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Makaleler getirilemedi.' });
    }
});

// Get a single post by slug and increment view
app.get('/api/blog/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        // Increment view atomically
        const post = await prisma.post.update({
            where: { slug },
            data: { views: { increment: 1 } },
            include: {
                comments: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!post) return res.status(404).json({ error: 'Makale bulunamadı.' });

        const author = await prisma.user.findUnique({
            where: { id: post.authorId },
            select: { name: true, avatar: true, role: true }
        });

        res.json({ ...post, author: author || { name: 'Bilinmeyen Yazar' } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Makale yüklenirken hata oluştu.' });
    }
});

// Create a new post (Teacher Only)
app.post('/api/blog', async (req, res) => {
    try {
        const { title, slug, content, excerpt, authorId, coverImage } = req.body;
        // In production, verify JWT for teacher role
        if (!title || !slug || !content || !authorId) {
            return res.status(400).json({ error: 'Eksik bilgi girdiniz.' });
        }

        const post = await prisma.post.create({
            data: { title, slug, content, excerpt, authorId, coverImage }
        });

        res.json({ success: true, post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Makale yayınlanamadı. (Slug/URL benzersiz olmalı)' });
    }
});

// Get posts for a specific author (Blog Manager)
app.get('/api/blog/my-posts/:authorId', async (req, res) => {
    try {
        const { authorId } = req.params;
        const posts = await prisma.post.findMany({
            where: { authorId },
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { comments: true } } }
        });
        res.json({ success: true, posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Makaleleriniz alınamadı.' });
    }
});

// Delete a post
app.delete('/api/blog/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.post.delete({ where: { id } });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Makale silinemedi.' });
    }
});

// Add a comment to a post
app.post('/api/blog/:postId/comment', async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, authorName, authorId } = req.body;

        if (!content || !authorName) {
            return res.status(400).json({ error: 'Yorum içeriği ve isim zorunlu.' });
        }

        const comment = await prisma.comment.create({
            data: { content, authorName, authorId, postId }
        });

        res.json({ success: true, comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Yorum gönderilemedi.' });
    }
});

// ==========================================
// DASHBOARD STATS ENDPOINT (Real Data)
// ==========================================

// GET /api/dashboard/stats/:authorId
app.get('/api/dashboard/stats/:authorId', async (req, res) => {
    try {
        const { authorId } = req.params;

        // My posts with comment counts
        const posts = await prisma.post.findMany({
            where: { authorId },
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { comments: true } } }
        });

        // Aggregate totals
        const totalPosts = posts.length;
        const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
        const totalComments = posts.reduce((acc, p) => acc + (p._count?.comments || 0), 0);

        // Joined date from user record
        const user = await prisma.user.findUnique({
            where: { id: authorId },
            select: { createdAt: true }
        });

        res.json({
            success: true,
            stats: { totalPosts, totalViews, totalComments },
            posts: posts.slice(0, 5), // last 5 for table
            joinedAt: user?.createdAt || null,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Dashboard verileri alınamadı.' });
    }
});

// ==========================================
// RESTORED ENDPOINTS: CLASSROOMS
// ==========================================

app.post('/api/classrooms', async (req, res) => {
    try {
        const { name, teacherId } = req.body;
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const classroom = await prisma.classroom.create({
            data: { name, teacherId, code }
        });
        res.json({ success: true, classroom });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sınıf oluşturulamadı' });
    }
});

app.get('/api/classrooms/teacher/:teacherId', async (req, res) => {
    try {
        const classrooms = await prisma.classroom.findMany({
            where: { teacherId: req.params.teacherId },
            include: { students: true }
        });
        res.json({ success: true, classrooms });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sınıflar getirilemedi' });
    }
});

app.get('/api/classrooms', async (req, res) => {
    try {
        const classrooms = await prisma.classroom.findMany({ include: { students: true } });
        res.json({ success: true, classrooms });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sınıflar getirilemedi' });
    }
});

app.post('/api/classrooms/join', async (req, res) => {
    try {
        const { code, studentId, studentName } = req.body;
        const classroom = await prisma.classroom.findUnique({ where: { code } });
        if (!classroom) return res.status(404).json({ error: 'Sınıf bulunamadı' });

        await prisma.classStudent.create({
            data: { classroomId: classroom.id, studentId, studentName }
        });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sınıfa katılınamadı (Zaten kayıtlı olabilirsiniz)' });
    }
});

// ==========================================
// RESTORED ENDPOINTS: STUDENT PROFILE / GAMIFICATION
// ==========================================

app.get('/api/user/profile/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Kullanıcı bulunamadı' });
    }
});

app.get('/api/user/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Giriş yapın' });
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Kullanıcı bulunamadı' });
    }
});

app.get('/api/user/:id/rank', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        res.json({ success: true, points: user?.points || 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Puan getirilemedi' });
    }
});

app.post('/api/user/reward', async (req, res) => {
    try {
        const { userId, points } = req.body;
        const user = await prisma.user.update({
            where: { id: userId },
            data: { points: { increment: points } }
        });
        res.json({ success: true, points: user.points });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Puan eklenemedi' });
    }
});

// ==========================================
// RESTORED ENDPOINTS: LIBRARY / ACADEMY STUDIO
// ==========================================

app.post('/api/library', async (req, res) => {
    try {
        const { title, videoId, subject, author, authorId, questions } = req.body;
        
        let questionsData = [];
        if (questions && questions.length > 0) {
            questionsData = questions.map(q => ({
                timestampSec: q.timestampSec,
                prompt: q.prompt,
                options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options),
                correctIndex: q.correctIndex
            }));
        }

        const libraryItem = await prisma.libraryItem.create({
            data: {
                title, videoId, subject, author, authorId,
                questions: {
                    create: questionsData
                }
            }
        });
        res.json({ success: true, libraryItem });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'İçerik kaydedilemedi' });
    }
});

app.get('/api/library', async (req, res) => {
    try {
        const items = await prisma.libraryItem.findMany({
            include: { questions: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'İçerikler getirilemedi' });
    }
});

app.get('/api/library/:id', async (req, res) => {
    try {
        const item = await prisma.libraryItem.findUnique({
            where: { id: req.params.id },
            include: { questions: true }
        });
        if (item) {
           await prisma.libraryItem.update({ where: { id: item.id }, data: { views: { increment: 1 } }});
        }
        res.json({ success: true, item });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'İçerik getirilemedi' });
    }
});

app.delete('/api/library/:id', async (req, res) => {
    try {
        await prisma.libraryItem.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'İçerik silinemedi' });
    }
});

app.get('/api/library/:id/comments', async (req, res) => {
    try {
        const comments = await prisma.libraryComment.findMany({
            where: { itemId: req.params.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, comments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Yorumlar getirilemedi' });
    }
});

app.post('/api/library/:id/comment', async (req, res) => {
    try {
        const { content, authorName, authorId } = req.body;
        const comment = await prisma.libraryComment.create({
            data: { content, authorName, authorId, itemId: req.params.id }
        });
        res.json({ success: true, comment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Yorum eklenemedi' });
    }
});

// ==========================================
// RESTORED ENDPOINTS: GAME STUDIO
// ==========================================

app.post('/api/games/seed/:userId', async (req, res) => {
    try {
       res.json({ success: true });
    } catch (err) {
       console.error(err);
       res.status(500).json({ error: 'Hata' });
    }
});

app.get('/api/games/teacher/:userId', async (req, res) => {
    try {
        const games = await prisma.gameTemplate.findMany({
            where: { teacherId: req.params.userId },
            include: { questions: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, games });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Oyunlar getirilemedi' });
    }
});

app.get('/api/games', async (req, res) => {
    try {
        const games = await prisma.gameTemplate.findMany({
            include: { questions: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, games });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Oyunlar getirilemedi' });
    }
});

app.post('/api/games', async (req, res) => {
    try {
        const { title, category, teacherId, isPublic } = req.body;
        const game = await prisma.gameTemplate.create({
            data: { title, category, teacherId, isPublic }
        });
        res.json({ success: true, game });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Oyun oluşturulamadı' });
    }
});

app.delete('/api/games/:id', async (req, res) => {
    try {
        await prisma.gameTemplate.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Oyun silinemedi' });
    }
});

app.post('/api/games/:id/questions', async (req, res) => {
    try {
        const { type, prompt, payload, timeLimit, orderIndex } = req.body;
        const question = await prisma.gameQuestion.create({
            data: {
                gameTemplateId: req.params.id,
                type, prompt, payload: typeof payload === 'string' ? payload : JSON.stringify(payload), 
                timeLimit, orderIndex
            }
        });
        res.json({ success: true, question });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Soru eklenemedi' });
    }
});

app.get('/api/games/:id', async (req, res) => {
    try {
        const game = await prisma.gameTemplate.findUnique({
            where: { id: req.params.id },
            include: { questions: true }
        });
        res.json({ success: true, game });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Oyun getirilemedi' });
    }
});

// ==========================================
// LIVE INTERACTIVE CLASSROOM ENGINE (V12)
// ==========================================
const sessions = {};

function generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit pin
}

io.on('connection', (socket) => {
    // Teacher starts a live session
    socket.on('create_session', (data, callback) => {
        const pin = generatePin();
        sessions[pin] = {
            teacherId: socket.id,
            students: [],
            currentSlide: null,
            quizMode: false,
            answers: {}
        };
        socket.join(pin);
        console.log(`Live Session started: ${pin} by Teacher ${socket.id}`);
        callback({ success: true, pin });
    });

    // Student joins a session
    socket.on('join_session', (data, callback) => {
        const { pin, studentName } = data;
        const session = sessions[pin];

        if (!session) {
            return callback({ success: false, message: 'Geçersiz veya süresi dolmuş kod.' });
        }

        const student = { id: socket.id, name: studentName, score: 0 };
        session.students.push(student);
        socket.join(pin);

        // Notify teacher of the new attendance list
        io.to(session.teacherId).emit('attendance_update', session.students);

        // Send current state to joining student
        callback({
            success: true,
            sessionState: {
                currentSlide: session.currentSlide,
                quizMode: session.quizMode
            }
        });
    });

    // Teacher broadcasts slide change
    socket.on('change_slide', (data) => {
        const { pin, slide } = data;
        const session = sessions[pin];
        if (session && session.teacherId === socket.id) {
            session.currentSlide = slide;
            session.quizMode = false; // reset quiz on slide change
            session.answers = {}; // reset answers

            socket.to(pin).emit('sync_slide', { slide, quizMode: false });
        }
    });

    // Teacher switches to Quiz Mode for the current slide
    socket.on('toggle_quiz', (data) => {
        const { pin, isActive } = data;
        const session = sessions[pin];
        if (session && session.teacherId === socket.id) {
            session.quizMode = isActive;
            socket.to(pin).emit('sync_slide', { slide: session.currentSlide, quizMode: isActive });
        }
    });

    // Teacher ends quiz and shows leaderboard
    socket.on('show_results', (data) => {
        const { pin } = data;
        const session = sessions[pin];
        if (session && session.teacherId === socket.id) {
            session.quizMode = false;
            socket.to(pin).emit('show_results');
        }
    });

    // Teacher shares blank or specific canvas drawing stroke in real-time
    socket.on('draw_stroke', (data) => {
        const { pin, stroke } = data;
        const session = sessions[pin];
        if (session && session.teacherId === socket.id) {
            // Forward the stroke immediately to all students in room
            socket.to(pin).volatile.emit('receive_stroke', stroke);
        }
    });

    // Teacher clears the canvas
    socket.on('clear_canvas', (data) => {
        const { pin } = data;
        const session = sessions[pin];
        if (session && session.teacherId === socket.id) {
            socket.to(pin).emit('clear_canvas');
        }
    });

    // Student submits an answer
    socket.on('submit_answer', (data, callback) => {
        const { pin, answer } = data;
        const session = sessions[pin];
        if (session) {
            const student = session.students.find(s => s.id === socket.id);
            if (student) {
                session.answers[socket.id] = { answer, name: student.name };

                // Notify teacher of the exact live answer poll
                io.to(session.teacherId).emit('live_answers', session.answers);
                if (callback) callback({ success: true });
            }
        }
    });

    socket.on('disconnect', () => {
        // Basic cleanup: find if it was a student and remove from attendance
        for (const pin in sessions) {
            const session = sessions[pin];
            const index = session.students.findIndex(s => s.id === socket.id);
            if (index !== -1) {
                session.students.splice(index, 1);
                io.to(session.teacherId).emit('attendance_update', session.students);
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Dersa server running on port ${PORT}`);
});
