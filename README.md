This repository was created to provider a server to manage and query .sqlite and .csv files for the Database Visualization project sponsored by Langchain. Here are the repositories for the project:

- [LangGraph Cloud Backend](https://github.com/DhruvAtreja/DataVisualization)
- [Frontend](https://github.com/DhruvAtreja/data-visualization-frontend)

The project is deployed on [here](https://data-visualization-frontend-gamma.vercel.app/).

## Features

- File upload support for .sqlite and .csv files
- Automatic deletion of old files (older than 4 hours)
- Query the database using SQL
- Get the schema of the database

## Setup

1. Install dependencies:

   ```
   yarn install
   ```

2. Start the server:
   ```
   yarn start
   ```

## File Upload

The API supports file uploads with the following constraints:

- Allowed file types: .sqlite and .csv
- Files are stored in the `uploads/` directory
- A unique filename is generated for each upload using UUID

## File Cleanup

The server automatically deletes files older than 4 hours from the `uploads/` directory. However, it preserves a file named '921c838c-541d-4361-8c96-70cb23abd9f5.sqlite', which is the default database for the project.
