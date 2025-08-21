import { useState } from "react";

function App() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [result, setResult] = useState("");

  const generateSilo = () => {
    const keywordList = keywords
      .split("\n")
      .map(k => k.trim())
      .filter(Boolean);
    if (!topic || keywordList.length === 0) {
      setResult("Please enter both a topic and keywords.");
      return;
    }

    const cluster = keywordList
      .map(
        (kw, i) =>
          `→ ${kw}\n   ↳ Internal Link to: ${topic
            .toLowerCase()
            .replace(/\s+/g, "-")}-${i + 1}`
      )
      .join("\n\n");

    const fullPlan = `Reverse Silo Planner\n\nMain Topic:\n${topic}\n\nSubtopics:\n${cluster}`;
    setResult(fullPlan);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  const downloadPlan = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reverse-silo-plan.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Reverse Silo Planner 🚀
      </h1>

      <label>Main Topic</label>
      <textarea
        rows={2}
        value={topic}
        onChange={e => setTopic(e.target.value)}
        style={{ width: "100%", marginBottom: "15px" }}
      />

      <label>Keywords (one per line)</label>
      <textarea
        rows={6}
        value={keywords}
        onChange={e => setKeywords(e.target.value)}
        style={{ width: "100%", marginBottom: "15px" }}
      />

      <button onClick={generateSilo} style={{ marginBottom: "20px" }}>
        Generate Silo Plan
      </button>

      {result && (
        <>
          <pre style={{ background: "#f3f3f3", padding: "15px", whiteSpace: "pre-wrap" }}>
            {result}
          </pre>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button onClick={copyToClipboard}>Copy</button>
            <button onClick={downloadPlan}>Download</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
