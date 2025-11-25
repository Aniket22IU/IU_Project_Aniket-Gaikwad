# IU_Project_PCS-Aniket-Gaikwad

# MetroMorph - A generative urban city planner

# Problem statement
In each country the cities keep growing every year, it is becoming harder for the city planners to make the design of the city that is efficient. The traditional city planning takes a lot of time and efforts and money of the government. The planners have to study the population growth, terrain in the city and traffic management. The manual methods make it difficult to test different city layouts options for the best solution.
To solve this, we need a AI based system that can create and improve city layouts using the real time data such as population and terrain in the city and traffic management. This system can do designing of the roads, green zones, and residential areas. All these can be done in a way that reduces traffic and population.
To generate realistic city layouts we will use AI models like Graph Neural Networks(GNNs) and Diffusion models. By using this approach we can make the urban city planning process faster, more data driven and sustainable for future cities.



# Goal
1. To develop AI based system that can generate city layouts using population growth and terrain data.
2. To apply Graph Neural Networks (GNNs) for realistic designs and efficient road networks.
3. To use Diffusion Models for visualizing city layouts for simple understanding.
4. To promote green zones for a sustainable development of the city.
5. To evaluate the performance of generated layouts using travel time, green area ratio and accessibility.
6. To make system scalable and adaptable for different cities and terrain conditions across the world.

# Tech stack
Frontend:
1. React.js - for interactive web based UI.
2. Leaflet - to visualise city layouts and maps.

Backend:
1. FastAPI - to build APIs for running the model
2. Docker - for containers and easy deployment.

Database:
1. PostgreSQL - to store data

AI/ML stack:
1. Pytorch - for deep learning model development.
2. Pytorch geometric - for building and training GNNs.
3. Scikit-learn - for preprocessing scaling.
4. NumPy and Pandas - for data handling and analysis.
5. Simplified GNN model

Simulation Tools: 
1. GeoPandas - to handle map based data.
2. Shapely - for geometric operstions.
3. Rasterio - for reading and writing terrain and population data.
4. SUMO - for traffic simluation and flow analysis.

# System Architecture
1. Google Maps API: Elevation API for terrain heights, Places API for identifying green areas.
2. Data preprocessing: Organizes data into DataFrames, cleans noise and incorrect values, builds graph data structures.
3. GNN prediction: It loads a pre trained GNN model, takes input as nodes+ edges+ features.
4. Backend: It uses FastAPI server and API endpoints for fetching data, also handles communication between frontend and GNN


# Project Risk
GNN model prediction risk:
1. Description - The Graph Neural Network (GNN) used in MetroMorph may produce inaccurate or misleading predictions about green zones and terrain lands due to outdated satellite images. If the training data does notshows updated urban changes or the graph structure between land areas is not properly defined, the model may show misleading information.

2. Impact - Failed GNN predictions can result in misleading urban planning suggestions. An area that is now a residential complex might still be shown as green park, which leads to poor prediction of GNN model. This reduces user trust in the system which affects decision making of the city planning.

3. Mitigation - Train the GNN again from yime to time using new and updated map data.
                Keep track of which data and model version were used for results.
                Ignore or flag the predictions which are having low confidence.
                Let the admin review the predictions before final approval.

# Phase status
1. Conception phase - Done
2. Development phase - Done
3. Finalisation phase - Under progress 
