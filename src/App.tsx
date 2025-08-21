// src/App.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Copy, Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { nanoid } from "nanoid";

// --- UI Components ---
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10 mb-8">{children}</div>
);
const CardContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow"
  />
);
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 focus:outline-none"
  />
);
const Button = ({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`py-2 px-4 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${className}`}
  >
    {children}
  </button>
);
const IconButton = ({ icon, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: React.ReactNode }) => (
  <button
    {...props}
    className={`flex items-center justify-center p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${className}`}
  >
    {icon}
  </button>
);

// --- Types ---
interface Post {
  id: string;
  title: string;
  url: string;
}
interface TargetLink {
  url: string;
  anchorText: string;
}
interface LinkEntry {
  id: string;
  sourceUrl: string;
  sourceLabel: string;
  targetLinks: TargetLink[];
}

// --- Utility ---
const getUrlSlug = (value: string): string => {
  try {
    const url = new URL(value.trim());
    const segments = url.pathname.split("/").filter(Boolean);
    return segments.pop()?.replace(/[-_]/g, " ") || "";
  } catch {
    return value.replace(/[-_]/g, " ").trim();
  }
};

// --- Main App ---
const App = () => {
  const [homePageUrl, setHomePageUrl] = useState("");
  const [targetPageUrl, setTargetPageUrl] = useState("");
  const [targetPageKeyword, setTargetPageKeyword] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [statPage1Url, setStatPage1Url] = useState("");
  const [statPage2Url, setStatPage2Url] = useState("");
  const [redditUrl, setRedditUrl] = useState("");
  const [perplexityUrl, setPerplexityUrl] = useState("");
  const [verificationResult, setVerificationResult] = useState<{ type: "warning" | "success" | null; message: string | null }>({ type: null, message: null });
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(id);
    } finally {
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const addPost = (url = "") => {
    const newPost: Post = { id: nanoid(), title: url, url: url };
    setPosts((curr) => [...curr, newPost]);
  };

  const addPostsFromBulk = () => {
    const urls = bulkUrls.split("\n").map((url) => url.trim()).filter(Boolean);
    const newPosts = urls.map((url) => ({ id: nanoid(), title: url, url: url }));
    setPosts((curr) => [...curr, ...newPosts]);
    setBulkUrls("");
  };

  const removePost = (id: string) => {
    setPosts((curr) => curr.filter((p) => p.id !== id));
  };

  const checkSiloValidity = (currentPosts: Post[]) => {
    if (!targetPageUrl.trim()) return setVerificationResult({ type: "warning", message: "Missing target page URL." });
    if (currentPosts.length < 2) return setVerificationResult({ type: "warning", message: "At least two supporting posts required." });
    setVerificationResult({ type: "success", message: "✅ Your silo structure looks valid!" });
  };

  useEffect(() => { checkSiloValidity(posts); }, [posts, targetPageUrl]);

  const { linksList, siloType } = useMemo(() => {
    const allPages = [...posts];
    let type = "Simple Reverse Silo";

    if (redditUrl || perplexityUrl || (statPage1Url && statPage2Url)) type = "Outside-In Reverse Silo";

    if (redditUrl) allPages.splice(Math.floor(allPages.length / 2), 0, { id: nanoid(), title: "Reddit URL", url: redditUrl });
    if (perplexityUrl) allPages.splice(Math.floor(allPages.length / 2), 0, { id: nanoid(), title: "Perplexity URL", url: perplexityUrl });
    if (statPage1Url) allPages.unshift({ id: nanoid(), title: "Stat Page 1", url: statPage1Url });
    if (statPage2Url) allPages.push({ id: nanoid(), title: "Stat Page 2", url: statPage2Url });

    const linksList: LinkEntry[] = allPages.map((post, idx) => {
      const targetLinks: TargetLink[] = [];
      if (targetPageUrl) targetLinks.push({ url: targetPageUrl, anchorText: targetPageKeyword });
      if (idx < allPages.length - 1) targetLinks.push({ url: allPages[idx + 1].url, anchorText: `Learn more about ${getUrlSlug(allPages[idx + 1].title)}` });
      if (idx > 0) targetLinks.push({ url: allPages[idx - 1].url, anchorText: `Go back to ${getUrlSlug(allPages[idx - 1].title)}` });
      return { id: post.id, sourceUrl: post.url, sourceLabel: post.title, targetLinks };
    });

    if (targetPageUrl) {
      const targetOutbound: TargetLink[] = [];
      if (homePageUrl) targetOutbound.push({ url: homePageUrl, anchorText: "Return to Home Page" });
      if (allPages.length > 0) targetOutbound.push({ url: allPages[0].url, anchorText: `Start with ${getUrlSlug(allPages[0].title)}` });
      if (allPages.length > 1) targetOutbound.push({ url: allPages[allPages.length - 1].url, anchorText: `End with ${getUrlSlug(allPages[allPages.length - 1].title)}` });
      linksList.unshift({ id: "target-page", sourceUrl: targetPageUrl, sourceLabel: "Target Page", targetLinks: targetOutbound });
    }

    return { linksList, siloType: type };
  }, [posts, targetPageUrl, targetPageKeyword, homePageUrl, statPage1Url, statPage2Url, redditUrl, perplexityUrl]);

  const handleCopyAll = (entry: LinkEntry) => {
    let text = `From: ${entry.sourceUrl}\n\n`;
    entry.targetLinks.forEach((link) => {
      text += `Link to: ${link.url}\nAnchor Text: ${link.anchorText}\n\n`;
    });
    handleCopy(text, `all-${entry.id}`);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-4">Reverse Silo Planner 🚀</h1>
        {/* You can now build the rest of the UI using this state */}
      </div>
    </div>
  );
};

export default App;
