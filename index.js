const express = require("express");
const multer = require("multer");
const wordConverter = require("docx-pdf");
const path = require("path");
const fs = require("fs");

const app = express();

// استخدام مجلد /tmp المخصص للملفات المؤقتة في Vercel
const upload = multer({ dest: "/tmp/" });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/docxtopdf", upload.single("word"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("يرجى اختيار ملف أولاً.");
    }

    // تحديد مسار الملف المرفوع ومسار الملف الناتج
    const inputPath = req.file.path;
    const outputPath = path.join("/tmp", Date.now() + ".pdf");

    // عملية التحويل باستخدام الملف المرفوع فعلياً
    wordConverter(inputPath, outputPath, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send("فشل التحويل، تأكد من سلامة ملف Word.");
        }
        
        // إرسال الـ PDF للمستخدم
        res.download(outputPath, (downloadErr) => {
            if (downloadErr) console.error(downloadErr);
            
            // حذف الملفات فوراً بعد التحميل لتجنب امتلاء الذاكرة
            try {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            } catch (e) {
                console.log("Cleanup error");
            }
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
