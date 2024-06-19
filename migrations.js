const fs = require('fs');
const XLSX = require('xlsx');
const fetch = require('node-fetch');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Leer el archivo Excel
const workbook = XLSX.readFile('./Adult literacy rate - Female (%) (UNESCO)..csv');
const sheetName = workbook.SheetNames[0];
const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Función para crear el modelo en Kontent AI
async function createModel() {
    const url = 'https://manage.kontent.ai/v2/projects/5f973245-0582-0061-142f-d5f3b25c83f9/types';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhYmM4Mjk0MzZlMGI0NTVmYWQ4ZGRiYjYxNzNkMTRiYiIsImlhdCI6MTcxODgyMjkwMiwibmJmIjoxNzE4ODIyOTAyLCJleHAiOjE3MzQ2MzA0ODAsInZlciI6IjMuMC4wIiwidWlkIjoidmlydHVhbF81ZGQ1ZWMyNi02NzZiLTQ0MTYtOWQwMi02ZDYyMDU4OTQzYmMiLCJzY29wZV9pZCI6IjZiZTE0NmNhOTk2ODQ1NDRhYzczZmIzMjk5NGQ5ZDkxIiwicHJvamVjdF9jb250YWluZXJfaWQiOiJlZjRjODA5NDBkMWUwMGMyN2RlODhhNmZjMWFmNDQyYSIsImF1ZCI6Im1hbmFnZS5rZW50aWNvY2xvdWQuY29tIn0.YKtZBvVA21qXvUZo8_aGmn7uRQXvOZ6k1SpjgrfelLA';

    const model = {
        "codename": "literacy_rate",
        "name": "Literacy Rate",
        "elements": [
            { "name": "Location name", "codename": "location_name", "type": "text" },
            { "name": "ISO Alpha 3", "codename": "iso_alpha_3", "type": "text" },
            { "name": "Location Type", "codename": "location_type", "type": "text" },
            { "name": "Year", "codename": "year", "type": "number" },
            { "name": "Adult literacy rate - Female (%) (UNESCO)", "codename": "literacy_rate", "type": "number" }
        ]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(model)
    });

    if (response.ok) {
        console.log('Model created successfully');
    } else {
        console.error('Error creating model:', response.status, await response.text());
    }
}

// Función para poblar el modelo con datos
async function populateModel(data) {
    const url = 'https://manage.kontent.ai/v2/projects/5f973245-0582-0061-142f-d5f3b25c83f9/items';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhYmM4Mjk0MzZlMGI0NTVmYWQ4ZGRiYjYxNzNkMTRiYiIsImlhdCI6MTcxODgyMjkwMiwibmJmIjoxNzE4ODIyOTAyLCJleHAiOjE3MzQ2MzA0ODAsInZlciI6IjMuMC4wIiwidWlkIjoidmlydHVhbF81ZGQ1ZWMyNi02NzZiLTQ0MTYtOWQwMi02ZDYyMDU4OTQzYmMiLCJzY29wZV9pZCI6IjZiZTE0NmNhOTk2ODQ1NDRhYzczZmIzMjk5NGQ5ZDkxIiwicHJvamVjdF9jb250YWluZXJfaWQiOiJlZjRjODA5NDBkMWUwMGMyN2RlODhhNmZjMWFmNDQyYSIsImF1ZCI6Im1hbmFnZS5rZW50aWNvY2xvdWQuY29tIn0.YKtZBvVA21qXvUZo8_aGmn7uRQXvOZ6k1SpjgrfelLA';

    for (const item of data) {
        const contentItem = {
            "name": item['Location name'],
            "type": { "codename": "literacy_rate" },
            "elements": {
                "location_name": { "value": item['Location name'] },
                "iso_alpha_3": { "value": item['ISO Alpha 3'] },
                "location_type": { "value": item['Location Type'] },
                "year": { "value": parseFloat(item['Year']) },
                "literacy_rate": { "value": parseFloat(item['Adult literacy rate - Female (%) (UNESCO)']) }
            }
        };



        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contentItem)
        });

        console.log('response',response)

        if (response.ok) {
            console.log('Item created:', item['Location name']);
        } else {
            console.error('Error creating item:', response.status, await response.text());
        }
    }
}

// Ejecutar las funciones
createModel().then(() => {
    populateModel(sheet);
});
