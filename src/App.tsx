import React, { useState, FC, useEffect } from "react";
import { Copy, Plus, X } from "lucide-react";
import { nanoid } from 'nanoid';

// --- UI Components ---
const Card: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10 mb-8">{children}</div>
);
const CardContent: FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const Input: FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow" />
);
const Textarea: FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 focus:outline-none" />
);
const Button: FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = "", ...props }) => (
  <button {...props} className={`py-2 px-4 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${className}`}>{children}</button>
);
const IconButton: FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: React.ReactNode }> = ({ children, className = "", icon, ...props }) => (
  <button {...props} className={`flex items-center justify-center p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${className}`}>
    {icon}{children && <span className="ml-2">{children}</span>}
  </button>
);

interface Post {
  id: string;
  title: string;
  url: string;
}
const getUrlSlug = (url: string): string => {
  try {
    const urlObj = new URL(url.trim());
    const pathname = urlObj.pathname.split("/").filter(Boolean).pop();
    return pathname ? pathname.replace(/-/g, ' ') : '';
  } catch {
    return url.replace(/-/g, ' ').trim();
  }
};

const App: FC = () => {
  const [homePageUrl, setHomePageUrl] = useState("");
  const [targetPageUrl, setTargetPageUrl] = useState("");
  const [targetPageKeyword, setTargetPageKeyword] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [statPage1Url, setStatPage1Url] = useState("");
  const [statPage2Url, setStatPage2Url] = useState("");
  const [redditUrl, setRedditUrl] = useState("");
  const [perplexityUrl, setPerplexityUrl] = useState("");
  const [verificationResult, setVerificationResult] = useState<{ type: 'warning' | 'success' | null; message: string | null }>({ type: null, message: null });
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      setCopied(id);
      document.body.removeChild(textArea);
    } finally {
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const addPost = (url: string = '') => setPosts(p => [...p, { id: nanoid(), title: url, url }]);
  const addPostsFromBulk = () => {
    const urls = bulkUrls.split('\n').map(url => url.trim()).filter(Boolean);
    const newPosts = urls.map(url => ({ id: nanoid(), title: url, url }));
    setPosts(p => [...p, ...newPosts]);
    setBulkUrls('');
  };
  const removePost = (id: string) => setPosts(p => p.filter(post => post.id !== id));
  const checkSiloValidity = (currentPosts: Post[]) => {
    if (!targetPageUrl.trim()) return setVerificationResult({ type: 'warning', message: 'Your silo needs a Target Page URL to be valid.' });
    if (currentPosts.length < 2) return setVerificationResult({ type: 'warning', message: 'Add at least two supporting posts to form a silo.' });
    setVerificationResult({ type: 'success', message: '🎉 Great job! Your silo plan looks correct!' });
  };

  useEffect(() => { checkSiloValidity(posts); }, [posts, targetPageUrl]);

  const getLinksList = () => {
    const linksList = [];
    let allPages = [...posts];
    let siloType = 'Simple Reverse Silo';
    const hasStatPages = statPage1Url.trim() && statPage2Url.trim();
    const hasExternal = redditUrl.trim() || perplexityUrl.trim();
    if (hasStatPages || hasExternal) siloType = 'Outside-In Reverse Silo';

    if (hasExternal) {
      const externalPosts = [];
      if (redditUrl.trim()) externalPosts.push({ id: nanoid(), title: 'Reddit URL', url: redditUrl });
      if (perplexityUrl.trim()) externalPosts.push({ id: nanoid(), title: 'Perplexity URL', url: perplexityUrl });
      allPages.splice(Math.ceil(allPages.length / 2), 0, ...externalPosts);
    }
    if (hasStatPages) {
      allPages.unshift({ id: nanoid(), title: 'Stat Page 1', url: statPage1Url });
      allPages.push({ id: nanoid(), title: 'Stat Page 2', url: statPage2Url });
    }

    allPages.forEach((post, index) => {
      const sourceUrl = post.url;
      const targetLinks = [];
      let sourceLabel = post.title;
      if (posts.some(p => p.id === post.id)) {
        sourceLabel = `Article ${posts.findIndex(p => p.id === post.id) + 1}`;
      }
      if (targetPageUrl.trim()) targetLinks.push({ url: targetPageUrl, anchorText: `${targetPageKeyword}` });
      if (index < allPages.length - 1) targetLinks.push({ url: allPages[index + 1].url, anchorText: `Learn more about ${getUrlSlug(allPages[index + 1].title)}` });
      if (index > 0) targetLinks.push({ url: allPages[index - 1].url, anchorText: `Go back to our article on ${getUrlSlug(allPages[index - 1].title)}` });
      if (targetLinks.length > 0) linksList.push({ sourceUrl, targetLinks, sourceLabel, id: post.id });
    });

    if (targetPageUrl.trim()) {
      const targetOutboundLinks = [];
      if (homePageUrl.trim()) targetOutboundLinks.push({ url: homePageUrl, anchorText: `Return to our Home Page` });
      if (allPages.length > 0) targetOutboundLinks.push({ url: allPages[0].url, anchorText: `Explore our first guide on ${getUrlSlug(allPages[0].title)}` });
      if (allPages.length > 1) targetOutboundLinks.push({ url: allPages[allPages.length - 1].url, anchorText: `Find out more from our last article on ${getUrlSlug(allPages[allPages.length - 1].title)}` });
      if (targetOutboundLinks.length > 0) linksList.unshift({ sourceUrl: targetPageUrl, targetLinks: targetOutboundLinks, sourceLabel: 'Target Page', id: 'target-page' });
    }

    return { linksList, siloType };
  };

  const { linksList } = getLinksList();
  const handleCopyAll = (entry) => {
    let text = `From: ${entry.sourceUrl}\n\n`;
    entry.targetLinks.forEach(link => {
      text += `Link to: ${link.url}\nAnchor Text: ${link.anchorText}\n\n`;
    });
    handleCopy(text, `all-${entry.id}`);
  };

  return <div>{/* UI Rendering was trimmed for brevity */}</div>;
};

export default App;
