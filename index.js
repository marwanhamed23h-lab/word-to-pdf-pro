const express = require("express");
const multer = require("multer");
const wordConverter = require("docx-pdf");
const path = require("path");
const fs = require("fs");

const app = express();

// استخدام مجلد /tmp المخصص للملفات المؤقتة في الاستضافات السحابية
const upload = multer({ dest: "/tmp/" });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/docxtopdf", upload.single("word"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("يرجى اختيار ملف Word أولاً.");
    }

    // تحديد مسار الملف الذي رفعه المستخدم والمسار الجديد للـ PDF
    const inputPath = req.file.path;
    const outputPath = path.join("/tmp", Date.now() + ".pdf");

    // تحويل الملف المرفوع فعلياً وليس ملفاً ثابتاً
    wordConverter(inputPath, outputPath, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send("فشل التحويل. تأكد من أن الملف سليم.");
        }
        
        // إرسال الملف الناتج للمستخدم للتحميل
        res.download(outputPath, (downloadErr) => {
            if (downloadErr) console.error(downloadErr);
            
            // حذف الملفات المؤقتة فوراً لتجنب امتلاء السيرفر
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
    console.log(`Server is running on port ${PORT}`);
});
