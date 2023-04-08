import ReactFlow from "react-flow-renderer";
import ReactPaginate from "react-paginate";
import React, { useState, useEffect } from "react";
import "./WorkflowDesign.css";

const WorkflowDesigner = () => {
  const [workflow, setWorkflow] = useState({});
  const [moduleList, setModuleList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const modulesPerPage = 5;
  const [elements, setElements] = useState([
    {
      id: "input",
      type: "input",
      data: { label: workflow.inputType },
      position: { x: 100, y: 100 },
      sourcePosition: "right",
      targetPosition: "left",
    },
  ]);

  useEffect(() => {
    const workflowId = window.location.pathname.split("/")[2];
    fetch(`https://64307b10d4518cfb0e50e555.mockapi.io/workflow/${workflowId}`)
      .then((response) => response.json())
      .then((data) => setWorkflow(data))
      .catch((error) => console.error(error));
    fetch(
      `https://64307b10d4518cfb0e50e555.mockapi.io/modules?page=${currentPage}&limit=${modulesPerPage}`
    )
      .then((response) => response.json())
      .then((data) => setModuleList(data))
      .catch((error) => console.error(error));
  }, [currentPage]);

  const onElementAdd = (event, module) => {
    event.preventDefault();
    const position = { x: event.clientX, y: event.clientY };
    const newElement = {
      id: module.id,
      type: "default",
      data: { label: module.name },
      position: position,
      sourcePosition: "right",
      targetPosition: "left",
    };
    setElements([...elements, newElement]);
  };

  const onElementsRemove = (elementsToRemove) => {
    const remainingElements = elements.filter(
      (e) => !elementsToRemove.includes(e)
    );
    setElements(remainingElements);
  };

  const onModuleDragStart = (event, module) => {
    event.dataTransfer.setData("module", JSON.stringify(module));
  };

  const onCanvasDrop = (event) => {
    event.preventDefault();
    const module = JSON.parse(event.dataTransfer.getData("module"));
    onElementAdd(event, module);
  };

  const validateNode = (node) => {
    if (node.type === "input") {
      return true;
    }
    const incomingEdges = elements.filter((e) => e.target === node.id);
    if (incomingEdges.length === 0) {
      return false;
    }
    return true;
  };

  const nodeStyles = (node) => {
    if (node.type === "input") {
      return { border: "2px solid black" };
    }
    const incomingEdges = elements.filter((e) => e.target === node.id);
    if (incomingEdges.length === 0) {
      return { border: "2px solid red" };
    }
    return { border: "2px solid black" };
  };

  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetch(
      `https://64307b10d4518cfb0e50e555.mockapi.io/modules?page=${pageNumber}&limit=${modulesPerPage}`
    )
      .then((response) => response.json())
      .then((data) => setModuleList(data));
  };

  const pageCount = Math.ceil(99 / modulesPerPage);

  const pagination = (
    <ReactPaginate
      pageCount={pageCount}
      onPageChange={(data) => onPageChange(data.selected + 1)}
      containerClassName="pagination"
      pageClassName="page-item"
      pageLinkClassName="page-link"
      previousClassName="page-item"
      previousLinkClassName="page-link"
      nextClassName="page-item"
      nextLinkClassName="page-link"
      activeClassName="active"
      disabledClassName="disabled"
    />
  );

  const defaultNodeStyles = {
    border: "1px solid #777",
    background: "#333",
    color: "#fff",
    padding: 10,
  };

  return (
    <div>
      <h1>{workflow.name}</h1>
      <div>
        {moduleList.map((module) => (
          <div
            key={module.id}
            draggable
            onDragStart={(event) => onModuleDragStart(event, module)}
          >
            {module.name} ({module.inputType} -&gt; {module.outputType})
          </div>
        ))}
      </div>
      {pagination}
      <div onDrop={onCanvasDrop} onDragOver={(event) => event.preventDefault()}>
        <ReactFlow
          elements={elements}
          onElementAdd={onElementAdd}
          onElementsRemove={onElementsRemove}
          validateNode={validateNode}
          nodeTypes={{
            default: {
              ...defaultNodeStyles,
              ...nodeStyles,
            },
          }}
        />
      </div>
    </div>
  );
};

export default WorkflowDesigner;
