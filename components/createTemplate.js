import React, { useRef, useState } from "react";
import { render } from "react-dom";
import sample from "../assets/sample.json";
import styled from "styled-components";
import { Button, Page, Layout, Card } from "@shopify/polaris";

import EmailEditor from "react-email-editor";

function CreateTemplate(props) {
  const [design, setDesign] = useState(props.savedDesign);
  const emailEditorRef = useRef(null);
  //const savedDesign = props.savedDesign;
  const saveUpdatedDesign = props.saveUpdatedDesign;

  const saveDesign = () => {
    emailEditorRef.current.editor.saveDesign((design) => {
      saveDesign(saveUpdatedDesign(design));
      setDesign(design);
      //console.log("saveDesign", design);
      //alert("Design JSON has been logged in your developer console.");
    });
  };

  const exportHtml = () => {
    emailEditorRef.current.editor.exportHtml((data) => {
      const { design, html } = data;

      var blobData = new Blob([html], { type: "text/html" });
      const url = window.URL.createObjectURL(blobData);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `template.html`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      console.log("exportHtml", html);
      alert("Output HTML has been logged in your developer console.");
    });
  };

  const onDesignLoad = (data) => {
    console.log("onDesignLoad", data);
  };

  const onLoad = () => {
    emailEditorRef.current.editor.addEventListener(
      "onDesignLoad",
      onDesignLoad
    );
    emailEditorRef.current.editor.loadDesign(design);
  };

  return (
    <Page>
      <Layout>
        <Card title="React Email Editor">
          <Button outline onClick={saveDesign}>
            Save Design
          </Button>
          <Button outline onClick={exportHtml}>
            Export HTML
          </Button>
          <div>
            <EmailEditor ref={emailEditorRef} onLoad={onLoad} />
          </div>
        </Card>
      </Layout>
    </Page>
  );
}

export default CreateTemplate;
