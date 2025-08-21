import { useState } from "react";
import { Download, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Reverse Silo Planner 🚀
      </h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">Main Topic</label>
        <Textarea
          placeholder="e.g. Best Landlord Insurance"
          value={topic}
          onChange={e => setTopic(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Keywords (one per line)</label>
        <Textarea
          placeholder={`e.g.\nbest landlord insurance florida\ncheap landlord insurance california`}
          rows={6}
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
        />
      </div>

      <Button onClick={generateSilo} className="mb-6 w-full">
        Generate Silo Plan
      </Button>

      {result && (
        <>
          <div className="bg-gray-100 p-4 rounded mb-4 whitespace-pre-wrap font-mono">
            {result}
          </div>
          <div className="flex gap-4">
            <Button onClick={copyToClipboard} variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button onClick={downloadPlan} variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
