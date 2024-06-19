# kontent-migration

First, we need to specify the file, like in the following example:
  const workbook = XLSX.readFile('./Adult literacy rate - Female (%) (UNESCO)..csv');
Then, we need to create the model according to the CSV file, populate the data, and change the workflow state to "draft" and then to "publish".

# Install

Run the following command to install the dependencies:

- npm install
  
# Run Migration

To run the migration, use the following command:

- node migration-sdk.js
