import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./global.css"
import "./App.css";
import { navMain } from "./config/navMain";
import { Link } from "react-router-dom";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="flex min-h-0 justify-center items-center h-full w-full flex-1">
      <main>
      <h1>Welcome to </h1>

      {navMain.map((item, index) => (
        <div key={index}>
          <div className="my-4 mt-6 font-bold">{item.title}</div>
          <div className="flex gap-4 flex-wrap">
          {item.items.map((subItem, subIndex) => (
            <Link to={subItem.url} className="p-2 border rounded-md hover:bg-gray-200" key={`${index}-${subIndex}`}>{subItem.title}</Link>
          ))}
          </div>
        </div>
      ))}
      
    </main>
    </div>
  );
}

export default App;
