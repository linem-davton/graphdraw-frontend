# Task Scheduling

This project is a React-based frontend designed to visualize task schedules and logical models. It interfaces with a backend server, with the configuration specified in `config.json`.



## Table of Contents
1. [Technologies Used](#technologies-used)
2. [Features](#features)
3. [Setup](#setup)
4. [Usage](#usage)
5. [To-do list](#to-do-list)


## Technologies Used
**Frontend:**
    - React
    - JavaScript
    - CSS

**Backend:**
    - Python



## Features
- **Add Nodes and Edges**: Users can create a graph of the logical model by adding nodes and edges interactively through the interface.
- **Upload JSON File**: Also, one can upload a JSON file to visualize a pre-defined logical model.
- **Graph Visualization**: The application provides a clear visualization of the logical model, making it easy to understand task dependencies.
- **Scheduling Algorithms**: The application can schedule the graph using four different algorithms, offering flexibility and multiple approaches.
- **Schedule Visualization**: Users can visualize the resulting schedules in a bar graph format, providing a clear overview of the task timeline.
- **Configurable Backend**: The backend server configuration can be easily adjusted through the `config.json` file, allowing for flexible deployment.
- **Cross-Platform Compatibility**: The application works seamlessly across different devices and browsers.



## Setup
1. Clone the repository:
    git clone https://github.com/linem-davton/graphdraw-frontend.git

2. Navigate to the project directory:
    cd your-repo

3. Install dependencies:
   npm install
   
4. Ensure the backend server defined in config.json is running.

5. Start the development server:
   npm start
   


## Usage

### For Users

1. **Accessing the Application**
   - Open the web browser and navigate to the application URL 'https://eslab2.pages.dev/'(fake for now).

2. **Creating a Logical Model**
   - **Add Nodes and Edges**: Click on the "Add Node" button to create nodes. Use the "Add Edge" button to connect nodes, forming a logical model.
   - **Upload JSON File**: Alternatively, click on the "Upload JSON" button to upload a pre-defined logical model. The JSON file should follow this format:
     ```json
     {
       "application": {
         "jobs": [
           {
             "id": <job_id>,
             "wcet_fullspeed": <worst_case_execution_time_at_full_speed>,
             "mcet": <minimum_case_execution_time>,
             "deadline": <deadline>,
             "start_time": <start_time>
           },
           ...
         ],
         "messages": [
           {
             "id": <message_id>,
             "sender": <sender_id>,
             "receiver": <receiver_id>,
             "size": <message_size>,
             "timetriggered": <true_or_false>
           },
           ...
         ]
       },
       "platform": {
         "nodes": [
           {
             "id": <node_id>,
             "is_router": <true_or_false>
           },
           ...
         ],
         "links": [
           {
             "start": <start_node_id>,
             "end": <end_node_id>
           },
           ...
         ],
         "frequencies": [<frequency_1>, <frequency_2>, ...],
         "schemes": [
           {
             "id": <scheme_id>,
             "wcdt": <worst_case_delivery_time>,
             "wcct": <worst_case_computation_time>,
             "wccr": <worst_case_communication_rate>
           },
           ...
         ]
       }
     }
     ```

3. **Visualizing the Logical Model**
   - The logical model will be displayed as a graph. Nodes represent tasks, and edges represent dependencies between tasks.

4. **Scheduling the Tasks**
   - Click on the "Schedule" button to generate task schedules.
   - The application will use four different algorithms to schedule the tasks.

5. **Viewing the Schedule**
   - The resulting schedules will be visualized in a bar graph format.
   - Users can compare the different schedules generated by the algorithms.

6. **Saving and Exporting**
   



### For Developers

1. **Fork the front-end Repository**
   - Go to the project repositories
    - Front-end: https://github.com/linem-davton/graphdraw-frontend.git.
    - Back-end: I don't have the access to your back-end.
   - Click on the "Fork" button to create a copy of the repository in your GitHub account.

2. **Clone the Repository**
   - Clone the forked repository to your local machine:
     - Front-end: git clone https://github.com/linem-davton/graphdraw-frontend.git
     - Back-end: git clone https://github.com/don't/have/the/access.git


3. **Navigate to the Project Directory**
   - Change to the project directory:
     cd your-repo


4. **Install Dependencies**
   - Install the necessary dependencies for the frontend:
     npm install
    
   - Install the necessary dependencies for the backend:
     pip install -r requirements.txt
     

5. **Configure the Backend**
   - Ensure the backend server configuration is set correctly in `config.json`.
   - Adjust any settings as necessary for your development environment.


6. **Run the Application**
   - Start the backend server:
     uvicorn backend:app

   - Start the frontend development server:
     npm start
     
   - Open your browser and navigate to `http://localhost:3000` to view the application.


7. **Understanding the Project Structure**
   - Familiarize yourself with the project structure. Key directories include:
     - `src/` - Contains the React components and application logic.
     - `public/` - Contains the static assets and the HTML template.
  

8. **Making Changes**
   - Create a new branch for your feature or bugfix:
     git checkout -b feature/your-feature-name
     
   - Make your changes in the codebase.

   - Commit your changes with a descriptive commit message:
     
     git commit -m "Add feature X"
     
   - Push your changes to your forked repository:
     git push origin feature/your-feature-name
     

10. **Submitting a Pull Request**
    - Go to the original repository on GitHub.
    - Click on the "New Pull Request" button.
    - Select your branch and submit the pull request for review.

By following these steps, you can set up the project locally, understand its structure, make contributions, and submit your changes for review. Your contributions are greatly appreciated!




## To-do list 
1. Implement LL and RMS algorithm
2. Add the feature for entering/changing the information about nodes.(that slider thing)
3. Currently, the graph nodes sometimes overalaps, need to fix it by structuring it as a tree.
4. change few details in the JSON files.
5. Use CSS for the Visualisation of the Schedule.
6. Mention the name of the algorithms above the bar graphs for clarity. 
7. Add save/export button.
8. Change the jsonData to graph object. 
9. remove validate graph.
10. check if the graph is cyclic or not.
11. ldf and edf in single core(imp)
