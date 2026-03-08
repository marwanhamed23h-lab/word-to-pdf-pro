const express = require("express");
const multer = require("multer");
const wordConverter = require("docx-pdf");
const path = require("path");
const fs = require("fs");

const app = express();

// Vercel مسموح فقط بالكتابة في مجلد /tmp
const upload = multer({ dest: "/tmp/" });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/docxtopdf", upload.single("word"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("يرجى رفع ملف أولاً.");
    }

    // تحديد مسارات ديناميكية داخل المجلد المؤقت
    const inputPath = req.file.path;
    const outputPath = path.join("/tmp", Date.now() + "output.pdf");

    // عملية التحويل الاحترافية
    wordConverter(inputPath, outputPath, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send("حدث خطأ أثناء تحويل الملف.");
        }
        
        // إرسال الملف الناتج للمستخدم
        res.download(outputPath, (downloadErr) => {
            if (downloadErr) console.error(downloadErr);
            
            // تنظيف الملفات فوراً بعد التحميل للحفاظ على الخصوصية والمساحة
            try {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            } catch (cleanupErr) {
                console.error("Cleanup error:", cleanupErr);
            }
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});
