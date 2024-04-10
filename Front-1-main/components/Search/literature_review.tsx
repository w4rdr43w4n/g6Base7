import { FC, useState, useEffect } from "react";
import {
  searchAndProcess,
  save,
} from "@/app/api/search_utils/literature_utils";
import "../styles/srch_components.css";

interface props {
  query: string;
  value: string;
  isImport: (e: boolean) => void;
  importType:(e:string) => void;
  setOutput: (e: string) => void;
}

const LiteratureReview: FC<props> = ({ query, value, setOutput, isImport,importType }) => {
  const [liter, setliter] = useState("");
  const [style, setStyle] = useState("apa");
  const [generating, setGenerateState] = useState<boolean>(false);
  const [saving, setSaveState] = useState<boolean>(false);
  const [content, setcontent] = useState<boolean>(false);
  const [outTriggr, setOutTrigger] = useState(false);
  const [statusText, setStatus] = useState("Generate");
  const [saveText, setSave] = useState("save");
  const handleGenerateButton = () => {
    setOutput("");
    setcontent(false);
    setGenerateState(true);
  };
  const handleSaveButton = () => {
    setSaveState(true);
  };
  function handleImportButton(t:string) {
    importType(t)
    isImport(true)
  };
  const handleSelectedStyle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStyle(e.target.value);
  };
  const handleEditorChange = (
    event: React.ChangeEvent<HTMLParagraphElement>
  ) => {
    const value = event.target.textContent || "";
    if (outTriggr && content) {
      if (liter != "") {
        setliter(value);
      }
      setcontent(true);
    }
  };
  useEffect(() => {
    try {
      if (generating) {
        const fetchLR = async () => {
          if (query.length === 0) {
            setOutput("Please write a topic in Search bar of search tools!");
            setcontent(false);
          } else {
            const button: any = document.querySelector(".gener-lr");
            button.disabled = true;
            setStatus("Generating...");
            setOutput(
              `Writing a literature review about the topic ${query} ...`
            );
            setcontent(false);
            try {
              const response = await searchAndProcess(query, style);
              setOutput(response.data);
              setliter(response.data);
              setOutTrigger(true);
              setcontent(true);
            } catch (err) {
              setOutput(
                "We're facing some traffic problems, please try again later"
              );
              setGenerateState(false);
              setcontent(false);
            }
            setStatus("Generate");
            button.disabled = false;
            //setcontent(false);
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
  }, [generating, value, query, style]);
  useEffect(() => {
    try {
      if (saving) {
        const fetchSR = async () => {
          if (!content) {
            setOutput("Please generate some work before saving");
            setcontent(false);
          } else {
            const button: any = document.querySelector(".save-lr");
            button.disabled = true;
            setSave("saving...");
            //setOutput(`Writing a literature review about the topic ${query} ...`);
            try {
              //console.log(value);
              console.log(style);
              const response = await save("lr", query, liter, style, "null");
              //setOutput('');
            } catch (err) {
              setOutput(
                "We're facing some traffic problems, please try again later"
              );
              setcontent(false);
              setSaveState(false);
            }
            setSave("Save");
            button.disabled = false;
          }
        };

        fetchSR();
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
      setSaveState(false);
    }
  }, [saving, value, query, style]);
  return (
    <>
      <h1>Literature Review</h1>
      <section>
        <select
          onChange={handleSelectedStyle}
          value={style}
          className="cite-lr"
        >
          <option value="" disabled>
            Citation Type
          </option>
          <option value="apa">APA</option>
          <option value="ieee">IEEE</option>
          <option value="mla">MLA</option>
          <option value="ama">AMA</option>
          <option value="asa">ASA</option>
          <option value="aaa">AAA</option>
          <option value="apsa">APSA</option>
          <option value="mhra">MHRA</option>
          <option value="oscola">OSCOLA</option>
        </select>
        <button className="gener-lr" onClick={handleGenerateButton}>
          {statusText}
        </button>
        <button className="save-lr" onClick={handleSaveButton}>
          {saveText}
        </button>
        <button onClick={() => handleImportButton("lr")}>Import</button>
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

export default LiteratureReview;
