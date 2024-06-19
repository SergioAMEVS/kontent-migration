import XLSX from 'xlsx'
import { ManagementClient } from "@kontent-ai/management-sdk";

// Leer el archivo Excel
const workbook = XLSX.readFile('./Adult literacy rate - Female (%) (UNESCO)..csv');
const sheetName = workbook.SheetNames[0];
const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


const client = new ManagementClient({
    environmentId: '5f973245-0582-0061-142f-d5f3b25c83f9',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhYmM4Mjk0MzZlMGI0NTVmYWQ4ZGRiYjYxNzNkMTRiYiIsImlhdCI6MTcxODgyMjkwMiwibmJmIjoxNzE4ODIyOTAyLCJleHAiOjE3MzQ2MzA0ODAsInZlciI6IjMuMC4wIiwidWlkIjoidmlydHVhbF81ZGQ1ZWMyNi02NzZiLTQ0MTYtOWQwMi02ZDYyMDU4OTQzYmMiLCJzY29wZV9pZCI6IjZiZTE0NmNhOTk2ODQ1NDRhYzczZmIzMjk5NGQ5ZDkxIiwicHJvamVjdF9jb250YWluZXJfaWQiOiJlZjRjODA5NDBkMWUwMGMyN2RlODhhNmZjMWFmNDQyYSIsImF1ZCI6Im1hbmFnZS5rZW50aWNvY2xvdWQuY29tIn0.YKtZBvVA21qXvUZo8_aGmn7uRQXvOZ6k1SpjgrfelLA'
  })

const createModel = async () => {
    const response = await client.addContentType()
        .withData(buildModelData)
        .toPromise();

    console.log('Model created successfully');
}

const buildModelData = (builder) => {
    return {
        codename: "literacy_rate",
        name: "Literacy Rate",
        elements: [
            builder.textElement({ name: "Location name", codename: "location_name", type:"text" }),
            builder.textElement({ name: "ISO Alpha 3", codename: "iso_alpha_3",type:"text" }),
            builder.textElement({ name: "Location Type", codename: "location_type",type:"text" }),
            builder.numberElement({ name: "Year", codename: "year", type:"number" }),
            builder.numberElement({ name: "Adult literacy rate - Female (%) (UNESCO)", codename: "literacy_rate" , type:"number"})
        ]
    };
};

// Función para poblar el modelo con datos
async function populateModel(data) {
    for (const item of data) {
        //Primero crear el elemento de contenido
        const contentItem = await client.addContentItem()
            .withData({
                name: item['Location name'],
                type: { codename: 'literacy_rate' }
            })
            .toPromise();

        // Segundo llenar el elemento de contenido con datos
        await client.upsertLanguageVariant()
            .byItemId(contentItem.data.id)
            .byLanguageCodename('default')
            .withData(builder => {
                return {
                    elements: [
                        builder.textElement({
                            element: { codename: 'location_name' },
                            value: item['Location name']
                        }),
                        builder.textElement({
                            element: { codename: 'iso_alpha_3' },
                            value: item['ISO Alpha 3']
                        }),
                        builder.textElement({
                            element: { codename: 'location_type' },
                            value: item['Location Type']
                        }),
                        builder.numberElement({
                            element: { codename: 'year' },
                            value: parseFloat(item['Year'])
                        }),
                        builder.numberElement({
                            element: { codename: 'literacy_rate' },
                            value: parseFloat(item['Adult literacy rate - Female (%) (UNESCO)'])
                        })
                    ]
                };
            })
            .toPromise();

        console.log('Item created and populated:', item['Location name']);
    }
}


//Cambiar el estado del workflow de los elementos a Publish
async function publishContent() {
    const literacyRateVariantsResponse = await client.listLanguageVariantsOfContentType()
        .byTypeCodename('literacy_rate')
        .toPromise();

    for (const variant of literacyRateVariantsResponse.data.items) {
        try {
            // Retraso antes de publicar cada elemento
            await new Promise(resolve => setTimeout(resolve, 1000));
            await client.publishLanguageVariant()
                .byItemId(variant.item.id)
                .byLanguageId(variant.language.id)
                .withoutData()
                .toPromise();

            console.log('Published item:', variant.item.id);
            
        } catch (error) {
            console.error('Failed to publish item:', variant.item.id, error);
        }
    }

    console.log('All literacy rate items published');
}
// Ejecutar las funciones
// createModel().then(() => {
//     populateModel(sheet).then(() => {
//         publishContent();
//     });
// });

publishContent()