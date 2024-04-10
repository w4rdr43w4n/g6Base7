import { searchInSemantic } from "./semantic";
import { default as axios } from "axios";
import { resData } from "@/app/config/types";
import searchInArxiv from "./arxiv";
import URLS from "@/app/config/urls";
import { db } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function searchAndProcess(
  query: string,
  style: string,
  retries = 3,
  delay = 500
) {
  const spRes: resData[] = [];
  try {
    let res: any[] = [];

    try {
      res = await searchInSemantic(query, 15);
    } catch (error) {
      console.error("Error in searchInSemantic:", error);
      res = await searchInArxiv(query, 10);
    }
    let filteredResults = res.filter((r) => r.abstract !== null);
    filteredResults = filteredResults.slice(0, 5);
    filteredResults.forEach((r) => {
      const item: resData = {
        title: r.title,
        authors: r.authors,
        pdf_url: r.pdf_url,
        published: r.published,
        abstract: r.abstract,
      };
      spRes.push(item);
    });
    console.log(spRes);
    const res1 = await literature(spRes, style, query);
    console.log(res1);
    return res1;
  } catch (error) {
    if (retries > 0) {
      // Wait for the specified delay before retrying
      await sleep(delay);
      // Retry the request with one less retry attempt and double the delay
      return searchAndProcess(query, style, retries - 1, delay * 2);
    } else {
      // If no more retries left, throw the error
      throw error;
    }
  }
}
export async function literature(
  items: resData[],
  style: string,
  query: string,
  retries = 3,
  delay = 500
) {
  console.log(items);
  const reqData = {
    Researches: items,
    style: style,
    subject: query,
  };

  try {
    return axios
      .post(`${URLS.urls.backendUrl}/${URLS.endpoints.literature}`, reqData)
      .then((res) => {
        console.log(res);
        return res;
      });
  } catch (error) {
    if (retries > 0) {
      // Wait for the specified delay before retrying
      await sleep(delay);
      // Retry the request with one less retry attempt and double the delay
      return literature(items, style, query, retries - 1, delay * 2);
    } else {
      throw error;
    }
  }
}

export async function documentation(
  items: resData[],
  style: string,
  retries = 3,
  delay = 500
) {
  console.log(items);
  const reqData = {
    Researches: items,
    style: style,
  };

  try {
    // Return the Promise chain from the Axios POST request
    return axios
      .post(`${URLS.urls.backendUrl}/${URLS.endpoints.documentation}`, reqData)
      .then((res) => {
        console.log(res);
        return res;
      });
  } catch (error) {
    if (retries > 0) {
      // Ensure sleep is awaited
      await sleep(delay);
      // Retry the request with one less retry attempt and double the delay
      return documentation(items, style, retries - 1, delay * 2);
    } else {
      // If no more retries left, throw the error
      throw error;
    }
  }
}

// Define the sleep function if it's not already defined elsewhere

export async function plagiarism(text: string, retries = 3, delay = 500) {
  console.log(text);
  const reqData = {
    text: text,
    token:""
  };
  try {
    const resp = await axios.post(
      `${URLS.urls.backendUrl}/${URLS.endpoints.plagiarism}`,
      reqData
    );
    console.log(resp.data);
    if (resp.data.userId) {
      const newPlgRecord = await axios.post(URLS.endpoints.plg_record, {
        type: "plg",
        plgId: resp.data.userId,
      });
      if (newPlgRecord.data.ok) return resp;
      return { data: { message: "Something went wrong" } };
    }
  } catch (error) {
    if (retries > 0) {
      // Wait for the specified delay before retrying
      await sleep(delay);
      // Retry the request with one less retry attempt and double the delay
      return plagiarism(text, retries - 1, delay * 2);
    } else {
      // If no more retries left, throw the error
      throw error;
    }
  }
}

export async function searchAndDoc(
  query: string,
  style: string,
  retries = 3,
  delay = 500
) {
  const sdRes: resData[] = [];
  try {
    const res = await searchInSemantic(query);
    const filteredResults = res.filter((r: any) => r.pdf_url !== "");
    filteredResults.forEach((r: any) => {
      const item = {
        title: r.title,
        authors: r.authors,
        pdf_url: r.pdf_url,
        published: r.published,
      };
      sdRes.push(item);
    });
    console.log(sdRes);
    const re = await documentation(sdRes, style);
    console.log(re);
    return re;
  } catch (error) {
    if (retries > 0) {
      // Use setTimeout to create a delay and make it awaitable
      await sleep(delay);
      // Retry the request with one less retry attempt and double the delay
      return searchAndDoc(query, style, retries - 1, delay * 2);
    } else {
      // If no more retries left, throw the error
      throw error;
    }
  }
}

export async function article(
  query: string,
  refs: any[] = [],
  outline: string,
  arxiv: boolean,
  retries = 3,
  delay = 500
) {
  let filteredResults = [];
  if (refs.length == 0 && arxiv == false) {
    let res: any[] = [];
    try {
      res = await searchInSemantic(query, 40);
    } catch (error) {
      console.error("Error in searchInSemantic:", error);
      // If an error occurs, assign an empty array to res
      res = [];
    }
    console.log(res);
    filteredResults = res.filter(
      (r) => r.abstract !== null && r.pdf_url !== ""
    );
  } else {
    filteredResults = refs;
  }

  const reqData = {
    topic: query,
    res: filteredResults,
    outline: outline,
    arxiv: arxiv,
  };
  try {
    return axios
      .post(`${URLS.urls.backendUrl}/${URLS.endpoints.article}`, reqData)
      .then((res) => {
        console.log(res);
        return res;
      });
  } catch (error) {
    if (retries > 0) {
      // Wait for the specified delay before retrying
      await sleep(delay);
      // Retry the request with one less retry attempt and double the delay
      return article(query, refs, outline, arxiv, retries - 1, delay * 2);
    } else {
      // If no more retries left, throw the error
      throw error;
    }
  }
}

export async function outline(query: string, retries = 3, delay = 500) {
  let res: any[] = [];
  try {
    res = await searchInSemantic(query, 40);
  } catch (error) {
    console.error("Error in searchInSemantic:", error);
    // If an error occurs, assign an empty array to res
    res = [];
  }
  console.log(res);
  let filteredResults = res.filter(
    (r) => r.abstract !== null && r.pdf_url !== ""
  );
  const reqData = {
    topic: query,
    res: filteredResults,
  };
  try {
    return axios
      .post(`${URLS.urls.backendUrl}/${URLS.endpoints.outline}`, reqData)
      .then((res) => {
        console.log(res);
        return res;
      });
  } catch (error) {
    if (retries > 0) {
      // Wait for the specified delay before retrying
      await sleep(delay);
      // Retry the request with one less retry attempt and double the delay
      return outline(query, retries - 1, delay * 2);
    } else {
      // If no more retries left, throw the error
      throw error;
    }
  }
}
export async function save(
  type: string,
  title: string,
  content: string,
  style: string,
  outline: string,
  retries = 3,
  delay = 500
) {
  try {
    console.log(outline);
    const saverRecord = await axios.post(
      URLS.endpoints.saver,
      {
        type: type,
        title: title,
        content: content,
        style: style,
        outline: outline,
      }
    );
    console.log(saverRecord);
    if (saverRecord.data.ok) return { data: { message: "Saved" } };
    return { data: { message: "Something went wrong" } };
  } catch (error) {
    if (retries > 0) {
      // Wait for the specified delay before retrying
      await sleep(delay);
      // Retry the request with one less retry attempt and double the delay
      return save(type, title, content, style, outline, retries - 1, delay);
    } else {
      // If no more retries left, throw the error
      throw error;
    }
  }
}

export async function Import(type:string,title="",list=[],retries = 3,delay = 500) {
  try {
    const importResp = await axios.post(
      URLS.endpoints.import,
      {
        type:type,
        title:title,
        list:list
      }
    );
    if (importResp.status === 200) return { data: { message: "Imported",imports:importResp.data.imports }};
    return { data: { message: "Something went wrong" } };
  } catch (error:any) {
    if (retries > 0) {
      // Wait for the specified delay before retrying
      await sleep(delay);
      // Retry the request with one less retry attempt and double the delay
      return Import(type,title,list, retries - 1, delay);
    } else {
      // If no more retries left, throw the error
      return error.message
    }
  }
}
