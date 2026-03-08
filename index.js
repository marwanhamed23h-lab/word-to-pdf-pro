const express = require("express");
const multer = require("multer");
const wordConverter = require("docx-pdf");
const path = require("path");
const fs = require("fs");

const app = express();

// إعداد التخزين وإنشاء مجلد uploads تلقائياً إذا لم يوجد
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/docxtopdf", upload.single("word"), (req, res) => {
    if (!req.file) return res.status(400).send("لم يتم اختيار ملف.");

    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, "uploads", Date.now() + ".pdf");

    // عملية التحويل الديناميكية لكل مستخدم
    wordConverter(inputPath, outputPath, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("حدث خطأ أثناء معالجة الملف.");
        }
        
        // إرسال الملف للمستخدم وحذفه من السيرفر فوراً لتوفير المساحة
        res.download(outputPath, (downloadErr) => {
            if (downloadErr) console.log(downloadErr);
            
            // تنظيف السيرفر من الملفات المؤقتة
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`السيرفر يعمل الآن على المنفذ ${PORT}`));