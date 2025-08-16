import {  useState } from "react";
import ReactQuill from 'react-quill'; // Import Quill
import 'react-quill/dist/quill.snow.css'; // Import Quill CSS
function App() {
  const [prompt,setprompt]=useState("");
  const [file,setfile]=useState(null);
  const [summary,setsummary]=useState("");
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
    console.log("Uploading file:", file);
    console.log(prompt);
      if (file) {
        console.log("Calling");
        const formdata = new FormData();
        formdata.append('pdf', file);
        formdata.append('prompt',prompt);
        const response = await fetch("http://localhost:3000/upload/pdf", {
  method: "POST",
  body: formdata
});
const responseData = await response.json();
setsummary(responseData.data.choices[0].message.content);
console.log(responseData);
        console.log("file uploaded");
      }
    }
    catch(error){
      console.log(error)
    }
};
  const handleFileInput = (e:any) => {
    if (e.target.files && e.target.files[0]) {
      console.log(e.target.files[0])
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
    console.log('Edited Content:', summary);
  };
  const shareEditable=async()=>{
        try{
          if(email===""){
            alert("Enter a valid email first");
          }
        const formdata = new FormData();
        formdata.append('email', email);
        formdata.append('title',"Meeting minutes");
        formdata.append('html',summary);
        const response = await fetch("http://localhost:3000/send-email", {
        method: "POST",
        body: formdata
        });
        const responseData = await response.json();
        console.log(responseData)
        }catch(error){
          console.log(error)
        }
  }
  const [email,setemail]=useState("");
  return (
    <div className="w-screen min-h-screen">
      <div>
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
        <button onClick={generateHandler}>Generate</button>
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
        <input type="email" placeholder="enter receiver email" onChange={(e:any)=>{setemail(e.target.value)}}></input>
        <button onClick={shareEditable}>Share</button>
      </div>
    </div>
  );
}
export default App
