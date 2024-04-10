import { FC, useState, useEffect } from "react";
import { documentation, save } from "@/app/api/search_utils/literature_utils";
import "../styles/srch_components.css";
import { validateAuthors } from "@/app/lib/formVaild";

interface props {
  value: string;
  onExit: (e: boolean) => void;
  isImport: (e: boolean) => void;
  importType: (e: string) => void;
  setOutput: (e: string) => void;
}
type Item = {
  title: string;
  authors: string;
  published: string;
  pdf_url: string;
};
const ReferencePopup: FC<props> = ({ value,onExit,isImport,importType,setOutput}) => {
  // hooks
  const [statusText, setStatus] = useState("Generate");
  const [errorMessage, setMessage] = useState("");
  const [errorMessageAuthor, setMessageAuthor] = useState("");
  const [Ref, setRef] = useState("null");
  const [saving, setSaveState] = useState<boolean>(false);
  const [content, setcontent] = useState<boolean>(false);
  const [outTriggr, setOutTrigger] = useState(false);
  const [saveText, setSave] = useState("save work");
  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    pdf_url: "",
    published: "",
  });
  const [style, setStyle] = useState("apa");
  const [collectedItems, setCollectedItems] = useState<Item[]>([]);
  // Value Handlers
  const handleSelectedStyle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStyle(e.target.value);
  };
  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleSave = () => {
    const { title, authors, published, pdf_url } = formData;
    if (
      title.trim().length !== 0 &&
      authors.trim().length !== 0 &&
      pdf_url.trim().length !== 0 &&
      published.trim().length !== 0
    ) {
      setMessage("");
      const newData = {
        title: title,
        authors: authors,
        published: published,
        pdf_url: pdf_url,
      };
      if (!validateAuthors(newData.authors)) {
        setMessageAuthor("Invalid Author Names");
      } else {
        setMessageAuthor("");
        setCollectedItems((prevData) => [...prevData, newData]);

        // Clear the input values
        setFormData({
          title: "",
          authors: "",
          pdf_url: "",
          published: "",
        });
      }
    } else {
      setMessage(
        "Please fill all feilds with required information to save it."
      );
    }
  };
  const handleSaveButton = () => {
    setSaveState(true);
  };
  const handleExit = () => {
    onExit(false);
  };
  function handleImportButton(t:string) {
    importType(t)
    isImport(true)
  };
  const handleSendData = async () => {
    try {
      const nonEmpty = collectedItems.filter(
        (ref) =>
          ref.title.trim().length !== 0 ||
          ref.authors.trim().length !== 0 || // Check if authors array is not empty
          ref.pdf_url.trim().length !== 0 ||
          ref.published.trim().length !== 0
      );
      // Create a new list of references with authors as arrays
      const data = nonEmpty.map((ref) => ({
        ...ref,
        authors: ref.authors.includes(",")
          ? ref.authors.split(",").map((author) => author.trim())
          : [ref.authors.trim()],
      }));
      if (data.length === 0) {
        setMessage("Please enter and save at least one reference.");
      } else {
        setStatus("Generating...");
        setMessage("");
        const button: any = document.querySelector(".ref-btn");
        button.disabled = true;
        setOutput("Generating references list from the saved data...");
        setcontent(false);
        try {
          const response = await documentation(data, style);
          setOutput(response.data);
          setRef(response.data);
          setcontent(true);
          setOutTrigger(true);
        } catch (err) {
          setOutput(
            "We're facing some traffic problems, please try again later"
          );
          setcontent(false);
        }

        setStatus("Generate");
        button.disabled = false;
        setCollectedItems([]);
      }
    } catch (error) {
      console.error("Error sending data to API:", error);
    }
  };
  const handleEditorChange = (
    event: React.ChangeEvent<HTMLParagraphElement>
  ) => {
    const value = event.target.textContent || "";
    if (outTriggr && content) {
      if (Ref != "") {
        setRef(value);
      }
      setcontent(true);
    }
  };
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
            //setLrOutput(`Writing a literature review about the topic ${query} ...`);
            try {
              //console.log(lrOutput);
              console.log(style);
              const response = await save("ref", "null", Ref, style, "null");
              //setLrOutput('');
            } catch (err) {
              setOutput(
                "We're facing some traffic problems, please try again later"
              );
              setcontent(false);
              setSaveState(false);
            }
            setSave("save work");
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
  }, [saving, value, style]);
  return (
    <section className="custom-lr">
      <section className="custom-lr-data">
        <h1>Saved Data</h1>
        <ul className="output-lr">
          <p className="error-msg-popup">{errorMessage}</p>
          {collectedItems.map((_data, i) => (
            <li key={i}>Saved Reference: {i + 1}</li>
          ))}
        </ul>
      </section>
      <section className="custom-lr-data">
        <h1>Custom References</h1>
        <label htmlFor="title">Title</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleDataChange}
          placeholder="Group Theory"
        />
        <label htmlFor="authors">
          Authors<span className="error-msg-popup"> {errorMessageAuthor}</span>
        </label>
        <input
          name="authors"
          value={formData.authors}
          onChange={handleDataChange}
          placeholder="John Doe, Frank Tom"
        />
        <label htmlFor="published">Publish Year</label>
        <input
          name="published"
          value={formData.published}
          onChange={handleDataChange}
          placeholder="2011"
          min="1905"
          max="2100"
          type="number"
        />
        <label htmlFor="pdf_url">PDF Url</label>
        <input
          name="pdf_url"
          value={formData.pdf_url}
          onChange={handleDataChange}
          placeholder="https://website/file.pdf"
        />

        <select
          onChange={handleSelectedStyle}
          value={style}
          className="cite-lr"
        >
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
        <section>
        <button onClick={() => handleImportButton("ref")}>Import</button>
          <button onClick={handleSave}>Save</button>
          <button className="ref-btn" onClick={handleSendData}>
            {statusText}
          </button>
          <button className="save-lr" onClick={handleSaveButton}>
            {saveText}
          </button>
        </section>
        <button className="exit-lr-btn" onClick={handleExit}>
          EXIT
        </button>
      </section>
      <section className="custom-lr-data">
        <h1>References List</h1>
        <div
          className="output-lr"
          onInput={handleEditorChange}
          contentEditable="true"
          suppressContentEditableWarning
        >
          {value}
        </div>
      </section>
    </section>
  );
};

export default ReferencePopup;
