const express = require('express');
const nodemailer=require("nodemailer");
const app = express();
const port = process.env.PORT || 3000;
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const cors=require('cors')
const multer=require('multer')
const dotenv=require('dotenv');
dotenv.config();
app.use(express.json());
app.use(cors({
    origin:["https://ai-powered-meeting-notes-summarizer-ecru.vercel.app","https://ai-powered-meeting-no-git-94520a-gaurav-sahus-projects-e1bcfc89.vercel.app/"],
    credentials:true,
}))
const storage=multer.diskStorage({
     destination:function(req,file,cb){
        cb(null,'uploads/');
     },
     filename:function(req,file,cb){
        const uniqueSuffix=Date.now()+ '-' +Math.round(Math.random()*1e9);
        cb(null,`${uniqueSuffix}-${file.originalname}`);
     }
})
const upload=multer({storage:storage});
app.get('/', (req, res) => {
  res.send('Hello, Vercel! Your Express app is working!');
});
app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  try {
    const file = req.file;
    console.log(file)
    const prompt = req.body.prompt;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log(file.path)
    const loader =new PDFLoader(file.path)
    const perPageDocs =await loader.load();
    const combinedContent = perPageDocs.map(doc => doc.pageContent).join('\n');
    console.log(combinedContent)

    const systemPrompt = `
You are an AI assistant that is capable of summarizing meeting notes or call transcripts in an organized, structured, and precise manner. Your goal is to interpret the provided transcript and generate a summary based on the user’s specific request. The summary should be concise, well-structured, and in **bullet points** for easy readability.

**Guidelines for the summary**:
1. Follow the user’s prompt strictly (e.g., "Summarize in bullet points for executives" or "Highlight only action items").
2. Extract key points and provide a coherent and focused summary that fulfills the user's prompt.
3. If the prompt asks for specific details (e.g., "Action items"), make sure to only summarize those.
4. Present the summary in HTML format, using appropriate tags such as <h5>, <ul>, and <li> for section headings and action items.
5. The output should not be in plain text; it should be in **HTML format** suitable for rendering in a web application or editor.
6. Avoid unnecessary details, focusing on the most important or actionable information.

---

**Transcript:**
${combinedContent}

**User’s Instruction (Prompt):**
${prompt}

---

**Your Task:**
Based on the provided transcript and the user's instruction, generate a clear and structured summary in HTML format with <h5> for section titles and <ul> and <li> for action items.
`;


    const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.API_KEY}`
    },
    body: JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content:"generate the summary of the fiven transacription"}
    ],
    temperature: 0.7
    })
    });
    const data = await response.json();
    return res.json({
      message: "File uploaded successfully",
      file: file,  // Sending back file info in the response
      prompt:prompt,
      data:data
    });
  } catch (error){
    console.log(error);
    return res.status(500).json({ message: "An error occurred during file upload" });
  }
});
app.post('/send-email', upload.none(), async (req, res) => {
  try {
    const { email, title, html } = req.body;
    if (!email || !title || !html) {
      return res.json({
        success: false,
        message: "Missing required fields: email, title, or html."
      });
    }
    await mailsender(email,title,html)
    return res.json({
      success: true,
      message: "Email sent successfully"
    });
  } catch (error) {
    console.error("Error processing email:", error);
    return res.json({
      success: false,
      message: "Error processing email request"
    });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
const mailsender=async(email,title,body)=>{
    try{
        const transporter= nodemailer.createTransport({
           host:process.env.MAIL_HOST,
           auth:{
            user:process.env.MAIL_USER,
            pass:process.env.MAIL_PASS
           }
        })
        let info=transporter.sendMail({
            from:"- gaurav sahu from Testimonial",
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`
        })
        console.log(info);
        return info;
    }
    catch(error){
        console.log(error.message)
    }
}

app.get('/gaurav', (req, res) => {
  res.send('getting get request');
});