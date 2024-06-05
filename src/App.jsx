import React, { useState, useRef, useEffect } from 'react';

import Ajv from 'ajv';

import './App.css';
import SVGApplicationModel from './SVGApplicationModel';
import SVGPlatformModel from './SVGPlatformModel'
import SlidersAM from './slidersAM';
import SlidersPM from './slidersPM';
import ScheduleVisualization from './ScheduleVisualization';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import examplejson from './example1.json';
import schema from './input_schema.json';
import scheduleSchema from './ScheduleSchema.json'
import { saveToLocalStorage, loadFromLocalStorage } from './utility';
import { generateRandomAM, generateRandomPM } from './randomModels';


const theme = createTheme({
  palette: {
    primary: {
      main: '#00b894',
    },
    secondary: {
      main: '#00b894',
    },
    background: {
      default: '#2d3436',
    },
    text: {
      primary: '#dfe6e9',
    }
  },

});

const nodeTypes = ['compute', 'router', 'sensor', 'actuator'];
const link_delay = 10;
const bandwidth = 10;
const link_type = "ethernet";
const message_size = 20;
const message_injection_time = 0;
const wcet = 10;
const mcet = 5;
const deadline = 500;



function App() {
  const [applicationModel, setApplicationModel] = useState({ tasks: [], messages: [] })
  const [platformModel, setPlatformModel] = useState({ nodes: [], links: [] })
  const [deleteMode, setDeleteMode] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedSVG, setSelectedSVG] = useState(null);

  const selectedSVGRef = useRef(selectedSVG);
  const applicationModelRef = useRef(applicationModel);
  const platformModelRef = useRef(platformModel);
  const applicationModelSVGRef = useRef();
  const platformModelSVGRef = useRef();

  const [highlightedTask, setHighlightedTask] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [highlightedMessage, setHighlightedMessage] = useState(null);
  const [highlightNodePM, setHighlightedNodePM] = useState(null);
  const [highlightedEdgePM, setHighlightedEdgePM] = useState(null);
  const [currentEdgeIndex, setCurrentEdgeIndex] = useState(0);
  const fileInputRef = useRef(null);
  const [savedData, setSavedData] = useState(null);

  useEffect(() => {
    selectedSVGRef.current = selectedSVG;
    console.log('selectedSVG:', selectedSVG);
    console.log('applicationModelSVGRef:', applicationModelSVGRef);
    console.log('platformModelSVGRef:', platformModelSVGRef);
    if (selectedSVG === "ApplicationModel" && applicationModelSVGRef.current) {
      console.log('scrolling to application model');
      applicationModelSVGRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (selectedSVG === "PlatformModel" && platformModelSVGRef.current) {
      console.log('scrolling to platform model');
      platformModelSVGRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedSVG]);

  useEffect(() => {
    applicationModelRef.current = applicationModel;
  }, [applicationModel]);

  useEffect(() => {
    platformModelRef.current = platformModel;
  }, [platformModel])


  useEffect(() => {
    const data = loadFromLocalStorage('model');
    if (data) {
      setSavedData(data);
    }
  }, []);

  const handleSave = () => {
    const currentApplicationModel = applicationModelRef.current;
    const currentPlatformModel = platformModelRef.current;
    const dataToSave = {
      application: currentApplicationModel,
      platform: currentPlatformModel
    };
    saveToLocalStorage('model', dataToSave);
    setSavedData(dataToSave);
  };

  const handleSavedLoad = () => {
    if (savedData) {
      setApplicationModel(savedData.application);
      setPlatformModel(savedData.platform);
    }
  };

  const loadDefaultJSON = () => {
    setApplicationModel(examplejson.application);
    setPlatformModel(examplejson.platform);
  };


  const addTasks = () => {
    setApplicationModel(prevGraph => {
      setHighlightedTask(prevGraph.tasks.length + 1);
      return {
        ...prevGraph,
        tasks: [...prevGraph.tasks, { id: prevGraph.tasks.length + 1, wcet: wcet, mcet: mcet, deadline: deadline }]
      }
    })
  };

  const addMessages = () => {
    const currentApplicationModel = applicationModelRef.current;
    const sender = parseInt(prompt('Enter sender task:'));
    const sourceNode = currentApplicationModel.tasks.find(node => node.id === sender);
    if (!sourceNode) {
      alert(`Task ${sender} does not exist`);
      console.log('Task does not exist', applicationModel.tasks)
      return;
    }

    const receiver = parseInt(prompt('Enter receiver task:'));
    const targetNode = currentApplicationModel.tasks.find(node => node.id === receiver);
    if (!targetNode) {
      alert(`Task ${receiver} does not exist`);
      return;
    }
    if (sender === receiver) {
      alert('Sender and receiver cannot be the same');
      return;
    }
    const message_exists = currentApplicationModel.messages.some(edge => edge.sender === sender && edge.receiver === receiver);
    if (message_exists) {
      alert('Dependency already exists');
      return;
    }

    const msgId = currentApplicationModel.messages.length;
    const message = { id: msgId, sender: sender, receiver: receiver, size: message_size, message_injection_time: message_injection_time }

    setApplicationModel(prevGraph => ({
      ...prevGraph,
      messages: [...prevGraph.messages, message]
    }));
  };

  const addNodes = () => {
    const currentPlatformModel = platformModelRef.current;


    const nodeId = currentPlatformModel.nodes.length;
    const type = parseInt(prompt('Enter node type: 0-compute, 1-router, 2-sensor, 3-actuator'));
    if (isNaN(type) || type < 0 || type > 3) {
      alert('Invalid node type');
      return;
    }
    setPlatformModel(prevGraph => ({
      ...prevGraph,
      nodes: [...prevGraph.nodes, { id: nodeId, type: nodeTypes[type] }]
    }));
  };
  const addLinks = () => {
    const currentPlatformModel = platformModelRef.current;
    const sender = parseInt(prompt('Enter start node:'));
    const sourceNode = currentPlatformModel.nodes.find(node => node.id === sender)
    if (!sourceNode) {
      alert('Node does not exist');
      return;
    }

    const receiver = parseInt(prompt('Enter receiver node:'));
    const targetNode = currentPlatformModel.nodes.find(node => node.id === receiver);
    if (!targetNode) {
      alert('Node does not exist');
      return;
    }
    if (sender === receiver) {
      alert('Start node and End node cannot be the same');
      return;
    }
    if (sourceNode.type !== 'router' && targetNode.type !== 'router') {
      alert('One node must be a router');
      return;
    }
    const link_exists = currentPlatformModel.links.some(edge => edge.start_node === sender && edge.end_node === receiver);
    if (link_exists) {
      alert('Link already exists');
      return;
    }

    // Add the link
    const linkId = currentPlatformModel.links.length;
    const link = { id: linkId, start_node: sender, end_node: receiver, link_delay: link_delay, bandwidth: bandwidth, type: link_type }
    if (!isNaN(link_delay)) {
      setPlatformModel(prevGraph => ({
        ...prevGraph,
        links: [...prevGraph.links, link]
      }));
    }
    setHighlightedEdgePM({ start_node: sender, end_node: receiver });

  };

  const handleFileUpload = () => {
    setHighlightedTask(null);
    setHighlightedEdgePM(null);
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    readFileContents(file);

  };
  const readFileContents = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target.result;
      try {
        const parsedData = JSON.parse(contents);
        // to do  Validate the JSON data to schema before setting the state
        const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
        const validate = ajv.compile(schema);
        const valid = validate(parsedData);

        if (!valid) {
          console.log('JSON Validation errors:', validate.errors);
          setErrorMessage('JSON data does not match schema');
        } else {
          setApplicationModel(parsedData.application);
          setPlatformModel(parsedData.platform);
        }
      } catch (error) {
        setErrorMessage('Upload Valid JSON')
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);

  };

  useEffect(() => {
    if (applicationModel.tasks.length && platformModel.nodes.length)
      scheduleGraph();
  }, [applicationModel, platformModel])

  const downloadJsonFile = () => {
    const currentApplicationModel = applicationModelRef.current;
    const currentPlatformModel = platformModelRef.current;


    const combinedJsonData = {
      application: currentApplicationModel,
      platform: currentPlatformModel
    };

    // Convert the combined JSON data to a string
    const jsonString = JSON.stringify(combinedJsonData, null, 2);

    // Create a Blob containing the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = 'updated_data.json'; // Set the download attribute

    // Append the link to the document body
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Remove the link from the document body
    document.body.removeChild(link);
  };


  const scheduleGraph = async () => {
    if (!applicationModel || !platformModel) {
      setErrorMessage('No jobs to schedule');
      return;
    }
    const request = {
      application: applicationModel, platform: platformModel
    };

    try {
      const response = await fetch('http://localhost:8000/schedule_jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(request)

      });

      if (!response.ok) {
        setErrorMessage(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setScheduleData(() => {
        setErrorMessage('')
        return data
      });
      console.log("Response from backend:", data);
    } catch (error) {
      setErrorMessage(`Error Connecting to Server`);
      console.error("Error sending data to backend:", error);
    }
  };

  const handleSVGClick = (svg) => {
    if (svg === "ApplicationModel")
      setSelectedSVG(prev => prev === "ApplicationModel" ? null : "ApplicationModel");
    else
      setSelectedSVG(prev => prev === "PlatformModel" ? null : "PlatformModel");
  };

  const handleGenerateRandom = () => {

    if (selectedSVG === "ApplicationModel") {
      const nodes = parseInt(prompt('Enter number of tasks'));

      if (nodes <= 0 || isNaN(nodes)) {
        alert("Enter Positive Integer Value");
        return;
      }
      setApplicationModel(generateRandomAM(nodes));
    }
    if (selectedSVG === "PlatformModel") {
      const compute = parseInt(prompt('Enter number of compute nodes'));
      const routers = parseInt(prompt('Enter number of routers'));
      const sensors = parseInt(prompt('Enter number of sensors'));
      const actuators = parseInt(prompt('Enter number of actuators'));
      if (compute <= 0 || routers <= 0 || sensors <= 0 || actuators <= 0 || isNaN(compute) || isNaN(routers) || isNaN(sensors) || isNaN(actuators)) {
        alert("Enter Positive Integer Value");
        return;
      }
      setPlatformModel(generateRandomPM(compute, routers, sensors, actuators));
    }

  };


  useEffect(() => {
    const handleKeyDown = (event) => {

      // Access the latest state using refs
      const currentSelectedSVG = selectedSVGRef.current;
      const currentApplicationModel = applicationModelRef.current;
      const currentPlatformModel = platformModelRef.current;
      // Define the key combinations for the shortcuts
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        downloadJsonFile();
      }
      else if (event.ctrlKey && event.key === 'o') {
        event.preventDefault();
        handleFileUpload();
      }
      else if (event.key === 'Tab') {
        event.preventDefault();
        setSelectedSVG(prev => prev === "ApplicationModel" ? "PlatformModel" : "ApplicationModel");
      }
      else if (event.key === '1') {
        console.log('1 pressed');
        if (currentSelectedSVG === "ApplicationModel") {
          console.log('Adding tasks');
          addTasks()
        }
        else if (currentSelectedSVG === "PlatformModel") {
          addNodes()
        }
      }
      else if (event.key === '2') {
        if (currentSelectedSVG === "ApplicationModel") {
          addMessages()
        }
        else if (currentSelectedSVG === "PlatformModel") {
          addLinks()
        }
      }
      else if (event.key === 'Delete' || event.key === 'Backspace' || event.key === 'd') {
        setDeleteMode(prev => !prev);
      }
      else if (event.ctrlKey && event.key === 'S') {
        handleSave();

      }
      else if (event.key === 'w') {
        if (currentSelectedSVG === "ApplicationModel") {
          setCurrentTaskIndex((prevIndex) => {
            setHighlightedTask(currentApplicationModel.tasks[(prevIndex + 1) % currentApplicationModel.tasks.length]?.id);
            return currentApplicationModel.tasks.length ? (prevIndex + 1) % currentApplicationModel.tasks.length : 0;
          });
        }
        else if (currentSelectedSVG === "PlatformModel") {
          setCurrentEdgeIndex((prevIndex) => {
            setHighlightedEdgePM(prevLink => {
              const link = currentPlatformModel.links[(prevIndex + 1) % currentPlatformModel.links.length];
              return { start_node: link?.start_node, end_node: link?.end_node }
            });

            return currentPlatformModel.links.length ? (prevIndex + 1) % currentPlatformModel.links.length : 0;
          });
        }
      };

    }

    // Add event listener for keydown events
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div className="app-container">
        <div className="sidebar">
          <h1>Distributed Scheduling</h1>

          {(selectedSVG === "ApplicationModel") && (
            <>
              <button className="button" onClick={addTasks}>Add Task</button>
              {applicationModel.tasks.length > 1 &&
                <button className="button" onClick={addMessages}>Add Task Dependency</button>
              }
              <button className="button" onClick={handleGenerateRandom}>Generate AM</button>
            </>)
          }
          {(selectedSVG === "PlatformModel") && (
            <>
              <button className="button" onClick={addNodes}>Add Node</button>
              {platformModel.nodes.length > 1 &&
                <button className="button" onClick={addLinks}>Add Link</button>
              }
              <button className="button" onClick={handleGenerateRandom}>Generate PM</button>
            </>)
          }
          {((applicationModel.tasks.length > 0 || platformModel.nodes.length > 0) && selectedSVG !== null) && (
            <>
              <label className="checkbox-label">
                <input type="checkbox" id="deleteMode" checked={deleteMode} onChange={() => {
                  setDeleteMode(prev => !prev);
                }} />
                <span>Delete Mode</span>
              </label>
            </>)
          }
          {selectedSVG === null && (
            <>
              <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
              <button className="button" onClick={handleFileUpload}>Upload JSON</button>
              <button className="button" onClick={loadDefaultJSON}>Load Default JSON</button>
              {savedData && <button className="button" onClick={handleSavedLoad}>Load Last Saved</button>}
            </>)
          }
          {(applicationModel.tasks.length > 0 || platformModel.nodes.length > 0) && (
            <>
              <button className="button" onClick={downloadJsonFile}>Download JSON</button>

              <button className="button" onClick={handleSave}>Save Locally</button>
            </>)
          }

          <footer className="navbar">
            <Typography variant="body1" align="center" className="footer-link">
              <Link href="https://eslab2docs.pages.dev/" underline="hover" target="_blank" rel="noopener noreferrer">
                Documentation
              </Link>
            </Typography>
            <Typography variant="body1" align="center" className="footer-link">
              <Link href="https://github.com/linem-davton/es-lab-task2" underline="hover" target="_blank" rel="noopener noreferrer">
                GitHub Backend
              </Link>
            </Typography>
          </footer>
        </div>

        <div className="main-content">
          <div className="svg-container">
            <div className="ApplicationMode" ref={applicationModelSVGRef} onClick={() => handleSVGClick("ApplicationModel")}>
              <h2 className={selectedSVG === "ApplicationModel" ? "active" : "inactive"}>Application Model</h2>
              <SVGApplicationModel
                graph={applicationModel}
                setGraph={setApplicationModel}
                deleteMode={deleteMode}
                highlightNode={highlightedTask}
                setHighlightedNode={setHighlightedTask}
                highlightedEdge={highlightedMessage}
                setHighlightedEdge={setHighlightedMessage}
                selectedSVG={selectedSVG}
              />
            </div>
            {highlightedTask !== null && <SlidersAM highlightNode={highlightedTask} graph={applicationModel} setGraph={setApplicationModel} />}

            <div className="PlatformModel" ref={platformModelSVGRef} onClick={() => handleSVGClick("PlatformModel")}>

              <h2 className={selectedSVG === "PlatformModel" ? "active" : "inactive"}>Platform Model</h2>
              <SVGPlatformModel
                graph={platformModel}
                setGraph={setPlatformModel}
                deleteMode={deleteMode}
                highlightNode={highlightNodePM}
                setHighlightedNode={setHighlightedNodePM}
                highlightedEdge={highlightedEdgePM}
                setHighlightedEdge={setHighlightedEdgePM}
                selectedSVG={selectedSVG}
              />
            </div>
            {highlightedEdgePM && <SlidersPM highlightedEdge={highlightedEdgePM} graph={platformModel} setGraph={setPlatformModel} />}
          </div>
          {scheduleData &&
            <div className="schedule-data">
              <ScheduleVisualization schedules={scheduleData} />
            </div>}
        </div>

      </div >
      {
        errorMessage &&
        <div className="error-message">
          {errorMessage}
        </div>
      }

    </ThemeProvider >

  );
}
export default App;
