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

    const requestId = crypto.randomUUID();
    const existingRequests = JSON.parse(localStorage.getItem("requests")) || [];

    const newRequest = {
      id: requestId,
      url,
      method: reqMethod,
      body,
    };

    const isRequestExisting = existingRequests.some(
      (req) =>
        req.url === newRequest.url &&
        req.method === newRequest.method &&
        req.body === newRequest.body
    );

    if (!isRequestExisting) {
      localStorage.setItem(
        "requests",
        JSON.stringify([...existingRequests, newRequest])
      );
    }
  };

  return (
    <form className="flex">
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
  );
}

export default React.memo(UrlEditor);
