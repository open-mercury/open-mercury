import Server from "./Server"

const stateSavePath = 'state.json';

new Server({ port: 8080 }, stateSavePath);
