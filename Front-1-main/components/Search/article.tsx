import { FC, useState, useEffect } from "react";
import { article, outline,save } from "@/app/api/search_utils/literature_utils";
import "../styles/srch_components.css";

interface props {
  query: string;
  value: string;
  isImport: (e: boolean) => void;
  importType:(e:string) => void;
  setOutput: (e: string) => void;
}

const Article: FC<props> = ({ query , value,isImport,importType,setOutput}) => {
  const [generating, setGenerateState] = useState<boolean>(false);
  const [statusText1, setStatus1] = useState("Generate");
  const [statusText2, setStatus2] = useState("Generate Outline");
  const [saveText, setSave] = useState("save");
  //const [statusText4, setStatus4] = useState("Save Outline");
  const [saving, setSaveState] = useState<boolean>(false);
  const [content, setcontent] = useState<boolean>(false);
  const [outTriggr, setOutTrigger] = useState(false);
  const [outlinee, setGenerateoutline] = useState<boolean>(false);
  const [outline_o, setOut] = useState("null");
  const [articlee, setart] = useState("");
  const [isarxiv, setIsarxiv] = useState<boolean>(false);
  const [refs, setRefs] = useState([]);
  const handleGenerateButton = () => {
    setOutput("");
    setGenerateState(true);
  };
  const handleGenerateoutlie = () => {
    setOutput("");
    setGenerateoutline(true);
  };
  const handleSaveButton = () => {
    setSaveState(true);
  };
  const handleRefreshButton  = () => {
    setOut('null');
    setart('');
    setOutput('');
    setSaveState(false);
    setcontent(false);
    setGenerateState(false);
    setOutTrigger(false);
    setRefs([]);
    setIsarxiv(false);
    setStatus1("Generate");
    setStatus2("Generate Outline");
    setSave("save");

  };
  /*
  const handleKeyDown = (event: React.KeyboardEvent) => {
    console.log("uiooi");
    //setOutput(event.currentTarget.textContent || '');
    setOutput(document?.querySelector('.output-lr')?.textContent)
    console.log(value);
 };*/
  const handleEditorChange = (
    event: React.ChangeEvent<HTMLParagraphElement>
  ) => {
    const value = event.target.textContent || "";
    if (outTriggr && content) {
      if (articlee != "")
         { setart(value);}
      else
          {setOut(value);}
      setcontent(true);
    }
  };
  function handleImportButton(t:string) {
    importType(t)
    isImport(true)
  };
  useEffect(() => {
    try {
      if (generating) {
        const fetchLR = async () => {
          if (query.length === 0) {
            setOutput("Please write a topic in search bar of search tools!");
            setcontent(false);
          } else {
            setStatus1("Generating...");
            setOutput(`Writing an article about the topic ${query} ...`);
            setcontent(false);
            const button: any = document.querySelector(".art-btn");
            button.disabled = true;
            try{
            const response = await article(query, refs, outline_o, isarxiv);
            setOutput(response.data);
            setcontent(true);
            //setOut('');
            setart(response.data)
            setOutTrigger(true);
            
            } catch(err){
              setOutput("We're facing some traffic problems, please try again later")
              setcontent(false);
              setGenerateState(false)
            }
            button.disabled = false
            setStatus1("Generate");
            //setOut("");
            setIsarxiv(false);
          }
        };
        fetchLR();
      }
    } catch (error) {
      if (error instanceof Error) {
        setOutput(error.message);
        setcontent(false);
      } else {
        setOutput("An unknown error occurred");
        setcontent(false);
      }
    } finally {
      setGenerateState(false);
    }
  }, [generating, query, refs, outline_o, isarxiv, value]);
  useEffect(() => {
    try {
      if (outlinee) {
        const fetchLR = async () => {
          if (query.length === 0) {
            setOutput("Please write a topic in Search bar of search tools!");
            setcontent(false);
          } else {
            const button: any = document.querySelector(".out-btn");
            button.disabled = true;
            setStatus2("Generating...");
            setOutput(`Creating an outline for the topic ${query} ...`);
            setcontent(false);
            
            try{
              const response = await outline(query);
              //setOutput(response.data);
              setOutput(response.data.outline);
              setcontent(true);
              setOut(response.data.outline);
              setart("");
              setRefs(response.data.refs);
              setIsarxiv(response.data.arxiv);
              setOutTrigger(true);
              } catch(err){
                setOutput("We're facing some traffic problems, please try again later")
                setcontent(false);
                setGenerateState(false)
              }
            setStatus2("Generate Outline");
            button.disabled = false;
          }
        };
        fetchLR();
      }
    } catch (error) {
      if (error instanceof Error) {
        setOutput(error.message);
        setcontent(false);
      } else {
        setOutput("An unknown error occurred");
        setcontent(false);
      }
    } finally {
      setGenerateoutline(false);
    }
  }, [outlinee, query, refs, isarxiv]);
  useEffect(() => {
    try {
      if (saving) {
        console.log(content);
        const fetchSR = async () => {
          if (!content) {
            setOutput("Please generate some work before saving");
            setcontent(false);
          } else {
            const button:any = document.querySelector(".save-btn")
            button.disabled = true
            setSave("saving...");
            //setOutput(`Writing a literature review about the topic ${query} ...`);
            try{
              console.log(outline_o);
              if (articlee != "") 
                { const response = await save('ar',query,articlee,'ieee',outline_o);
              }
              else {const response = await save('out',query,outline_o,'null','null');}
              //setOutput('');
              } catch(err){
                setOutput("We're facing some traffic problems, please try again later")
                setcontent(false)
                setSaveState(false)
              }
            setSave("save")
            button.disabled = false
            //setcontent(false);
          }
        };

        fetchSR();
      }
    } catch (error) {
      if (error instanceof Error) {
        setOutput(error.message);
        setcontent(false)
      } else {
        setOutput("An unknown error occurred");
        setcontent(false)
      }
    } finally {
      setSaveState(false);
    }
  }, [saving, value, query]);
  return (
    <>
      <h1>Article</h1>
      <section>
      <button className="rf-btn" onClick={handleRefreshButton}>
          Refresh
        </button>
        <button className="art-btn" onClick={handleGenerateButton}>
          {statusText1}
        </button>
        <button className="out-btn" onClick={handleGenerateoutlie}>
          {statusText2}
        </button>
        <button className="save-btn" onClick={handleSaveButton}>
          {saveText}
        </button>
        <button onClick={() => handleImportButton("art")}>Import Article</button>
        <button onClick={() => handleImportButton("out")}>Import Outline</button>

      </section>
      <div
        className="output-lr"
        onInput={handleEditorChange}
        contentEditable="true"
        suppressContentEditableWarning
      >
        {value}
      </div>
    </>
  );
};

export default Article;
