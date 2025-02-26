import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { convertKeyValueToObject } from "../../../utils/helpers";
import UrlEditor from "../../Panes/RequestUrl/UrlEditor";
import RequestTabGroup from "../../Tab-Groups/RequestTabGroup";

const keyPairInitState = [
  {
    id: uuidv4(),
    keyItem: "",
    valueItem: "",
  },
];

export default function Request({ setResponse, setLoading, loading }) {
  const [url, setUrl] = useState(
    "https://jsonplaceholder.typicode.com/todos/1"
  );
  const [reqMethod, setReqMethod] = useState("GET");
  const [queryParams, setQueryParams] = useState(keyPairInitState);
  const [headers, setHeaders] = useState(keyPairInitState);
  const [body, setBody] = useState("{\n\t\n}");
  const [savedRequests, setSavedRequests] = useState([]);

  useEffect(() => {
    const storedRequests = JSON.parse(localStorage.getItem("requests")) || [];
    setSavedRequests(storedRequests);
  }, []);

  const handleSelectRequest = (e) => {
    const selectedId = e.target.value;
    const selectedRequest = savedRequests.find((req) => req.id === selectedId);
    if (selectedRequest) {
      setUrl(selectedRequest.url);
      setReqMethod(selectedRequest.method);
      const bodyString = Array.isArray(selectedRequest.body)
        ? selectedRequest.body.join("\n")
        : selectedRequest.body;
      setBody(bodyString);
      console.log("Updated Body:", bodyString);
    }
  };

  const handleRemoveRequest = (id) => {
    const updatedRequests = savedRequests.filter((req) => req.id !== id);
    setSavedRequests(updatedRequests);
    localStorage.setItem("requests", JSON.stringify(updatedRequests));
  };

  const handleOnInputSend = useCallback(
    async (e) => {
      setLoading(true);
      e.preventDefault();
      const requestBody = body.toString();
      console.log("http method", reqMethod);
      console.log("headers", headers);
      console.log("query params", queryParams);
      console.log("body", requestBody);

      let data;
      try {
        data = JSON.parse(requestBody);
      } catch (e) {
        alert("Something is wrong with the JSON data.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios({
          url,
          method: reqMethod,
          params: convertKeyValueToObject(queryParams),
          headers: convertKeyValueToObject(headers),
          data,
        });
        setResponse(response);
      } catch (e) {
        console.log(e);
        setResponse(e);
      }
      setLoading(false);
    },
    [url, reqMethod, queryParams, headers, body, setResponse, setLoading]
  );

  return (
    <>
      <div className="mb-4 flex items-center space-x-2">
        <select
          className="px-4 py-2 border rounded-md border-gray-300 hover:border-orange-500 focus:outline-none bg-gray-100"
          onChange={handleSelectRequest}
          defaultValue=""
        >
          <option value="" disabled>
            Select a saved request
          </option>
          {savedRequests.map((req) => (
            <option key={req.id} value={req.id}>
              {req.method} - {req.url}
            </option>
          ))}
        </select>

        <button
          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300"
          onClick={() => {
            const selectedOption = document.querySelector("select").value;
            if (selectedOption) {
              handleRemoveRequest(selectedOption);
            }
          }}
          disabled={savedRequests.length === 0}
        >
          Remove
        </button>
      </div>

      <UrlEditor
        url={url}
        setUrl={setUrl}
        reqMethod={reqMethod}
        body={body}
        setReqMethod={setReqMethod}
        onInputSend={handleOnInputSend}
      />
      <RequestTabGroup
        queryParams={queryParams}
        setQueryParams={setQueryParams}
        headers={headers}
        setHeaders={setHeaders}
        body={body}
        setBody={setBody}
      />
    </>
  );
}
