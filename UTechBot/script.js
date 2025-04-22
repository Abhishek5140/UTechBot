let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let micbtn = document.querySelector("#mic");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");

const Api_Url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=Your_Api_Key";
let user = {
  message: null,
  file: {
    mime_type: null,
    data: null,
  },
};

const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const synth = window.speechSynthesis;

micbtn.addEventListener("click", () => {
  recognition.start();
  micbtn.style.backgroundColor = "#ffeb3b";
});

recognition.onresult = (event) => {
  const speechResult = event.results[0][0].transcript;
  prompt.value = speechResult;
  micbtn.style.backgroundColor = "#4682b4";
  handlechatResponse(speechResult);
};

recognition.onerror = (event) => {
  console.error("Speech recognition error:", event.error);
  micbtn.style.backgroundColor = "#4682b4";
  alert("Could not understand audio. Please try again.");
};

recognition.onend = () => {
  micbtn.style.backgroundColor = "#4682b4";
};

async function generateResponse(aiChatBox, userMess) {
  let text = aiChatBox.querySelector(".ai-chat-area");

  const creatorQuestionRegex = /(who created you|who made you|who built you)/i;
  if (creatorQuestionRegex.test(userMess)) {
    const response =
      "I am a Tech Tutor AI Tool, Abhishek, Srinivas , and JeevanSingh created me!";
    text.innerHTML = response;
  } else {
    const TechPrompt = `You are TechTutorBot, an AI assistant specialized in providing detailed and practical tutorials on technology topics. Offer guidance on programming, cybersecurity, networking, software development, and other tech-related subjects. If a question falls outside the tech domain, inform the user that you are focused on technology-related queries. Keep responses concise and informative. User's question: ${userMess}`;

    let RequestOption = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: TechPrompt },
              user.file.data ? [{ inline_data: user.file }] : [],
            ],
          },
        ],
      }),
    };
    try {
      let response = await fetch(Api_Url, RequestOption);
      let data = await response.json();
      let apiResponse = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();
      text.innerHTML = apiResponse;
    } catch (error) {
      console.log(error);
      text.innerHTML = "Opps!, something went wrong.";
    }
  }

  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth",
  });
  // Only reset the image upload icon if a file was uploaded
  if (user.file.data) {
    image.src = "./img/img.svg";
    image.classList.remove("choose");
  }
  user.file = {};
}

function createChatBox(element, className) {
  let div = document.createElement("div");
  div.innerHTML = element;
  div.classList.add(className);
  return div;
}

function handlechatResponse(userMess) {
  user.message = userMess;
  let html = `<img src="./img/images.png" alt="" id="userImage" width="8%">
                <div class="user-chat-area">
                ${
                  user.file.data
                    ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" id="chooseimg" />`
                    : ""
                }
                ${user.message}
                </div>`;

  prompt.value = "";
  let userChatBox = createChatBox(html, "user-chat-box");
  chatContainer.appendChild(userChatBox);

  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth",
  });

  setTimeout(() => {
    let html = `<div style = "display: flex;" > 
                        <img src="./img/newlogo.jpg" alt="" id="aiImage" width="10%">
                        <div class="ai-chat-area">
                        <img src="./img/icons8-loading.gif" alt="" class="load" width="50px">
                        </div>
                    </div>`;

    let aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    generateResponse(aiChatBox, userMess);
  }, 600);
}

prompt.addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    handlechatResponse(prompt.value);
  }
});

submitbtn.addEventListener("click", () => {
  handlechatResponse(prompt.value);
});

imageinput.addEventListener("change", () => {
  const file = imageinput.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = (e) => {
    let base64string = e.target.result.split(",")[1];
    user.file = {
      mime_type: file.type,
      data: base64string,
    };
    image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
    image.classList.add("choose");
  };
  reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
  imagebtn.querySelector("input").click();
});
