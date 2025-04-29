import React from "react";

const requestMethods = [
  { slug: "get", method: "GET" },
  { slug: "post", method: "POST" },
  { slug: "put", method: "PUT" },
  { slug: "patch", method: "PATCH" },
  { slug: "delete", method: "DELETE" },
];

function UrlEditor({
  url,
  setUrl,
  reqMethod,
  setReqMethod,
  onInputSend,
  body,
}) {
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSend = (e) => {
    onInputSend(e);

    const existingRequests = JSON.parse(localStorage.getItem("requests")) || [];

    // Extract base URL without query parameters
    const getBaseUrl = (fullUrl) => {
      try {
        const urlObj = new URL(fullUrl);
        return `${urlObj.origin}${urlObj.pathname}`;
      } catch {
        return fullUrl.split("?")[0]; // Fallback if URL is invalid
      }
    };

    const baseUrl = getBaseUrl(url);

    // Find if a similar request exists (same method and base URL)
    const requestIndex = existingRequests.findIndex(
      (req) => req.method === reqMethod && getBaseUrl(req.url) === baseUrl
    );

    const requestId =
      requestIndex !== -1
        ? existingRequests[requestIndex].id
        : crypto.randomUUID();

    const newRequest = {
      id: requestId,
      url,
      method: reqMethod,
      body,
    };

    if (requestIndex !== -1) {
      existingRequests[requestIndex] = newRequest;
    } else {
      existingRequests.push(newRequest);
    }

    localStorage.setItem("requests", JSON.stringify(existingRequests));
  };

  const exportRequests = () => {
    const existingRequests = JSON.parse(localStorage.getItem("requests")) || [];

    const formattedRequests = existingRequests
      .map((req) => {
        return `URL: ${req.url}\nMethod: ${req.method}\nBody: ${req.body}\n\n`;
      })
      .join("");

    const blob = new Blob([formattedRequests], { type: "text/plain" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "requests.txt";
    link.click();

    URL.revokeObjectURL(link.href);
  };

  const importRequests = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;
      const requests = [];

      const requestBlocks = fileContent.split("\n\n");
      requestBlocks.forEach((block) => {
        const lines = block.split("\n");
        const request = {};

        let isBody = false;
        let bodyLines = [];

        lines.forEach((line) => {
          if (line.startsWith("URL:")) {
            request.url = line.split(": ")[1];
          } else if (line.startsWith("Method:")) {
            request.method = line.split(": ")[1];
          } else if (line.startsWith("Body:")) {
            isBody = true;
            bodyLines.push(line.split(": ")[1]);
          } else if (isBody) {
            bodyLines.push(line);
          }
        });

        // Join body lines into a single string
        if (bodyLines.length > 0) {
          request.body = bodyLines.join("\n");
        }

        if (request.url && request.method) {
          requests.push({ ...request, id: crypto.randomUUID() });
        }
      });

      const existingRequests =
        JSON.parse(localStorage.getItem("requests")) || [];
      const updatedRequests = [...existingRequests, ...requests];
      localStorage.setItem("requests", JSON.stringify(updatedRequests));

      window.location.reload();
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <form className="flex" onSubmit={handleSend}>
        <select
          className="px-4 py-2 border rounded-md border-gray-300 hover:border-orange-500 focus:outline-none bg-gray-100"
          value={reqMethod}
          onChange={(e) => setReqMethod(e.target.value)}
        >
          {requestMethods.map((option) => (
            <option key={option.slug} value={option.method}>
              {option.method}
            </option>
          ))}
        </select>
        <input
          className="ml-3 w-full px-4 py-2 border rounded-md border-gray-300 hover:border-orange-500 focus:outline-orange-500"
          value={url}
          onChange={handleUrlChange}
        />
        <button
          className="ml-3 px-6 py-2 rounded-md font-semibold text-white bg-orange-500 hover:bg-orange-600"
          type="button"
          onClick={handleSend}
        >
          Send
        </button>
      </form>

      {/* Export Button */}
      <button
        className="mt-4 px-6 py-2 rounded-md font-semibold text-white bg-blue-500 hover:bg-blue-600"
        type="button"
        onClick={exportRequests}
      >
        Export Requests
      </button>

      {/* Import Button */}
      <label className="mt-4 ml-4 px-6 py-2 rounded-md font-semibold text-white bg-green-500 hover:bg-green-600 cursor-pointer">
        Import Requests
        <input
          type="file"
          accept=".txt"
          style={{ display: "none" }}
          onChange={importRequests}
        />
      </label>
    </div>
  );
}

export default React.memo(UrlEditor);
