
import { useEffect, useState } from "react";
import {
  Sparkles,
  FileText,
  History,
  Copy,
  Save,
  WandSparkles,
} from "lucide-react";
import "./App.css";

function App() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("Blog");
  const [tone, setTone] = useState("Professional");
  const [generatedContent, setGeneratedContent] = useState("");
  const [savedContents, setSavedContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSavedContent();
  }, []);

  const fetchSavedContent = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/content");
      if (!response.ok) throw new Error("Failed to load content");

      const data = await response.json();
      setSavedContents(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerate = async () => {
  setMessage("");

  if (!topic.trim()) {
    setMessage("Please enter a topic first.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("http://127.0.0.1:8000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        content_type: contentType,
        tone,
        generated_content: "",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Content generation failed.");
    }

    setGeneratedContent(data.generated_content);
    setMessage("AI content generated successfully!");
  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoading(false);
  }
};

  const handleSave = async () => {
    if (!topic.trim() || !generatedContent.trim()) {
      setMessage("Generate or enter some content before saving.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          content_type: contentType,
          tone,
          generated_content: generatedContent,
        }),
      });
      
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to save content");
      }

      setMessage("Content saved successfully!");
      fetchSavedContent();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (contentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this content?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/content/${contentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to delete content");
      }

      setMessage("Content deleted successfully!");
      await fetchSavedContent();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleRewrite = async () => {
  if (!generatedContent.trim()) {
    setMessage("Please generate or enter content first.");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/rewrite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: generatedContent,
        tone,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Content rewriting failed.");
    }

    setGeneratedContent(data.rewritten_content);
    setMessage("Content rewritten successfully!");
  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoading(false);
  }
};


const handleSummarize = async () => {
  if (!generatedContent.trim()) {
    setMessage("Please generate or enter content first.");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: generatedContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Content summarization failed.");
    }

    setGeneratedContent(data.summary);
    setMessage("Content summarized successfully!");
  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoading(false);
  }
};


  const handleCopy = async () => {
    if (!generatedContent) return;

    try {
      await navigator.clipboard.writeText(generatedContent);
      setMessage("Content copied successfully!");
    } catch {
      setMessage("Unable to copy content.");
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <h2>
          <Sparkles size={24} /> ContentCraft AI
        </h2>
        <span>AI-Powered Content Manager</span>
      </nav>

      <header className="hero">
        <h1>Create Better Content with AI</h1>
        <p>Generate, manage and organize your content in one place.</p>
      </header>

      <main className="main-container">
        <section className="generator-card">
          <h2>
            <WandSparkles size={22} /> Create Content
          </h2>

          <label>Enter your topic</label>
          <input
            type="text"
            placeholder="e.g. Benefits of Artificial Intelligence"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <div className="form-row">
            <div>
              <label>Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              >
                <option>Blog</option>
                <option>Social Media Post</option>
                <option>Marketing Copy</option>
                <option>Product Description</option>
                <option>Email</option>
              </select>
            </div>

            <div>
              <label>Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option>Professional</option>
                <option>Casual</option>
                <option>Creative</option>
                <option>Friendly</option>
                <option>Persuasive</option>
              </select>
            </div>
          </div>

          <button
            className="generate-btn"
            onClick={handleGenerate}
          >
            <Sparkles size={18} />
{loading ? "Generating..." : "Generate Content"}
          </button>

          {message && <p className="status-message">{message}</p>}

          <div className="output-section">
            <h3>
              <FileText size={20} /> Generated Content
            </h3>

            <textarea
              placeholder="Your generated content will appear here..."
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
            />

            
<div className="output-actions">
  <button onClick={handleCopy}>
    <Copy size={17} /> Copy
  </button>

  <button onClick={handleRewrite} disabled={loading}>
    <WandSparkles size={17} />
    {loading ? "Processing..." : "Rewrite with AI"}
  </button>


<button onClick={handleSummarize} disabled={loading}>
  <FileText size={17} />
  {loading ? "Processing..." : "Summarize"}
</button>


  <button onClick={handleSave} disabled={loading}>
    <Save size={17} />
    {loading ? "Saving..." : "Save Content"}
  </button>
</div>
</div>
        </section>

        <section className="history-card">
          <h2>
            <History size={22} /> Saved Content
          </h2>

          {savedContents.length === 0 ? (
            <p>No saved content yet.</p>
          ) : (
            savedContents.map((item) => (
              <div className="history-item" key={item._id}>
                <h3>{item.topic}</h3>
                <span>{item.content_type} · {item.tone}</span>
                <p>{item.generated_content}</p>
                <button
                  onClick={() => {
                    setTopic(item.topic);
                    setContentType(item.content_type);
                    setTone(item.tone);
                    setGeneratedContent(item.generated_content);
                    setMessage("Saved content loaded.");
                  }}
                >
                  Open Content
                </button>
                <button
  type="button"
  onClick={() => {
    console.log("Delete clicked:", item._id);
    handleDelete(item._id);
  }}
>
  Delete
</button>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
