import {  useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
function App() {
  const [prompt,setprompt]=useState("");
  const [file,setfile]=useState(null);
  const [summary,setsummary]=useState("");
  const [Generaating,setGenrating]=useState(false);
  const [sharing ,setsharing]=useState(false)
  const [email,setemail]=useState("");
  const [emails,setemails]=useState<string[]>([]);
  const handleFileValidation = (file:any) => {
  if (file.type !== 'application/pdf') {
    alert('Please upload only PDF files');
    return;
  }
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    alert('File size must be less than 10MB');
    return;
  }
  setfile(file);
  };
  const handleFileUpload = async (file:any) => {
  try {
      if (file) {
        const formdata = new FormData();
        formdata.append('pdf', file);
        formdata.append('prompt',prompt);
        setGenrating(true);
        const response = await fetch(`https://ai-powered-meeting-notes-summarizer-and-oeh1.onrender.com/upload/pdf`, {
  method: "POST",
  body: formdata
});
const responseData = await response.json();
setsummary(responseData.data.choices[0].message.content);
setGenrating(false);
      }
    }
    catch(error){
      console.log(error)
      alert("Try Again later")
    }
  };
  const handleFileInput = (e:any) => {
    if (e.target.files && e.target.files[0]) {
      handleFileValidation(e.target.files[0]);
    }
  };
  const generateHandler=async()=>{
    try{
      handleFileUpload(file);
    }catch(error){
      console.log(error)
    }
  }
  const handleChange = (value:any) => {
    setsummary(value);
  };
  const saveEditedContent = () => {
    alert("summary saved successfully")
  };
  const shareEditable=async()=>{
        try{
          if(emails.length===0){
            alert("Enter a valid email first");
            return
          }
        const formdata = new FormData();
        formdata.append('emails', JSON.stringify(emails)); // Send array as JSON string
        formdata.append('title', "Meeting minutes");
        formdata.append('html', summary);
        setsharing(true);
        const response = await fetch(`https://ai-powered-meeting-notes-summarizer-and-oeh1.onrender.com/send-email`, {
        method: "POST",
        body: formdata
        });
        const responseData = await response.json();
        setsharing(false)
        setemails([]);
        alert("mails sends successfully")
        console.log(responseData)
        }catch(error){
          console.log(error)
        }
  }
  const addHandler=()=>{
      if(email===""){
        alert("Enter valid email")
      }
      setemails(prevEmails => [...prevEmails, email]);
      setemail("");
  }
  return (
    <div className="w-screen min-h-screen">
      <div>
        <div className="upload">
          Upload the text transcription PDF
        </div>
        <input
          type="file"
          accept=".pdf"// Attach ref to the input element // Hide the input element (it will be triggered by the button)
          onChange={handleFileInput}
        />
      </div>
      <div>
        <div>Enter your prompt here </div>
        <div>
          <input type="text" placeholder="enter prompt" onChange={(e)=>{setprompt(e.target.value)}}>
          </input>
        </div>
        <button onClick={generateHandler}>
         {
          Generaating ?(<div className="rotating-loader"></div>):("Generate")
         }
        </button>
      </div>
      <div>
      <h3>Edit Meeting Summary</h3>
      <ReactQuill
        value={summary}
        onChange={handleChange}
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'blockquote'],
            [{ 'align': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'font': [] }],
            [{ 'color': [] }, { 'background': [] }],
            ['code-block'],
          ],
        }}
      />
      <br />
      <button onClick={saveEditedContent}>Save Edited Summary</button>
      </div>
      <div>
        <div className="upload">Enter receiver email address</div>
        <input type="email" value={email} placeholder="enter receiver email" onChange={(e:any)=>{setemail(e.target.value)}}></input>
        <button className="add" onClick={addHandler}>Add</button>
        <button onClick={shareEditable}>
          {
            sharing ?(<div className="rotating-loader"></div>):("Share")
          }
        </button>
        <div>
          {
            emails.map((email,index)=>{
              return (
                <div key={`${index}`} className="email_item">{email}</div>
              )
            })
          }
        </div>
      </div>
    </div>
  );
}
export default App
