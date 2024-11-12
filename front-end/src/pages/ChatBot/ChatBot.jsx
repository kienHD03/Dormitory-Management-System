import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./ChatBot.css";

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const predefinedQA = [
    {
      prompt: "Cách đăng ký phòng",
      response: `
      Bước 1: Chọn chức năng đặt phòng
      Bước 2: Chọn phòng cần đặt
      Bước 3: Chọn giường còn trống
      Bước 4: Bấm xác nhận đặt phòng
      Bước 5: Quét mã QR để xác nhận đặt phòng
      Bước 6: Hoàn tất đặt phòng
      `,
    },
    {
      prompt: " Làm thế nào để gửi yêu cầu tới Ban Quản Lý KTX?",
      response: `
      Bước 1: Vào chức năng My request.
      Bước 2: Bấm vào nút Create new request -> Chọn loại yêu cầu (Type request) thích hợp.
      Bước 3: Điền nội dung của yêu cầu ở phần Content.
      Bước 4: Bấm vào nút Create request.
      `,
    },
    {
      prompt: "Nội quy ký túc xá",
      response: `
      - Không được nuôi vật nuôi, thú cưng (chó, mèo,...).
      - Không được uống rượu, bia, chơi cờ bạc, sử dụng các chất kích thích và chất cấm.
      - Không được nấu ăn trong ký túc xá.
      - Không được đưa người lạ không ở trong ký túc xá vào phòng sau giờ giới nghiêm.
      - Giờ giới nghiêm trong ký túc xá là sau 10 giờ 30 phút tối.
      - Giữ gìn vệ sinh chung và đổ rác trước 9 giờ sáng.
      `,
    },
    {
      prompt: "Làm thế nào để báo cáo sửa chữa đồ dùng trong phòng",
      response: `
      Bước 1: Vào chức năng My request
      Bước 2: Bấm vào nút Create new request -> Chọn Báo cáo vấn đề kỹ thuật ở mục Type request
      Bước 4: Điền những thông tin cần thiết và gửi ảnh tình trạng thiết bị 
      Bước 5: Bấm vào nút Create 
      `,
    },
    {
      prompt: "Thông tin liên lạc của bảo vệ và y tế là gì?",
      response: `
    Thông tin liên lạc của phòng bảo vệ và ban quản lý:
    Phòng bảo vệ: 0123456789
    Ban quản lý: 0123456789 
      `,
    },
  ];

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Function to match predefined prompts
  const getPredefinedResponse = (userPrompt) => {
    const foundQA = predefinedQA.find((qa) => qa.prompt.toLowerCase() === userPrompt.toLowerCase());
    return foundQA ? foundQA.response : null;
  };

  const getResponse = async (prompt) => {
    try {
      setIsLoading(true);
      const predefinedResponse = getPredefinedResponse(prompt);
      if (predefinedResponse) {
        setChatHistory((prevHistory) =>
          prevHistory.map((chat, index) =>
            index === prevHistory.length - 1 ? { ...chat, bot: predefinedResponse } : chat
          )
        );
      } else {
        const chatContext =
          chatHistory.map((chat) => `You: ${chat.user}\nBot: ${chat.bot}`).join("\n") +
          `\nYou: ${prompt}\nBot:`;
        console.log(chatContext);
        const result = await model.generateContent(chatContext);
        const responseText = result.response.text();

        setChatHistory((prevHistory) =>
          prevHistory.map((chat, index) =>
            index === prevHistory.length - 1 ? { ...chat, bot: responseText } : chat
          )
        );
      }
    } catch (error) {
      setChatHistory((prevHistory) =>
        prevHistory.map((chat, index) =>
          index === prevHistory.length - 1
            ? { ...chat, bot: "Error: Unable to generate response." }
            : chat
        )
      );
    } finally {
      setIsLoading(false); // Đặt lại trạng thái tải khi có câu trả lời
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      // Update chat history with the user's input before generating the bot's response
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { user: input, bot: "Generating..." }, // Placeholder for bot's response
      ]);
      getResponse(input);
      setInput("");
    }
  };

  // Handle predefined question selection
  const handleQuestionClick = (prompt) => {
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { user: prompt, bot: "Generating..." }, // Placeholder for bot's response
    ]);
    getResponse(prompt);
  };

  return (
    <div className="container">
      <h2>Chatbot</h2>

      {/* Options for predefined questions */}
      <div className="questionOptions">
        <h3>Chọn câu hỏi:</h3>
        {predefinedQA.map((qa, index) => (
          <button
            key={index}
            onClick={() => handleQuestionClick(qa.prompt)}
            className="questionButton"
            disabled={isLoading}
          >
            {qa.prompt}
          </button>
        ))}
      </div>

      <div className="chatBox">
        <div className="output">
          {chatHistory.map((chat, index) => (
            <div key={index}>
              <p className="message userMessage">
                <b>You:</b> {chat.user}
              </p>
              <p className="message botMessage">
                <b>Bot:</b>
                <br />
                {chat.bot.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input"
          placeholder="Ask something..."
        />
        <button type="submit" className="button" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
