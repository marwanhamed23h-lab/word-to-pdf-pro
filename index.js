const express = require("express");
const multer = require("multer");
const wordConverter = require("docx-pdf");
const path = require("path");
const fs = require("fs");

const app = express();

// استخدام مجلد /tmp الخاص بـ Vercel لأنه المجلد الوحيد المسموح بالكتابة فيه
const upload = multer({ dest: "/tmp/" });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/docxtopdf", upload.single("word"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("يرجى رفع ملف أولاً.");
    }

    // تحديد مسار الملف المرفوع ومسار الملف الناتج في المجلد المؤقت
    const inputPath = req.file.path;
    const outputPath = path.join("/tmp", Date.now() + "output.pdf");

    // عملية التحويل باستخدام المسارات الديناميكية
    wordConverter(inputPath, outputPath, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(500).send("خطأ في تحويل الملف.");
        }
        
        // إرسال الملف للمستخدم للتحميل
        res.download(outputPath, (err) => {
            if (err) console.log(err);
            
            // تنظيف الملفات المؤقتة بعد التحميل للحفاظ على الأداء
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});
