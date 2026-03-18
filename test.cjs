const parseCSV = (str) => {
    const arr = [];
    let quote = false;
    let col = 0, row = 0;

    for (let c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c + 1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';

        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
        if (cc == '"') { quote = !quote; continue; }
        if (cc == ',' && !quote) { ++col; continue; }
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }
        arr[row][col] += cc;
    }
    return arr;
};

const csvToJson = (csvData) => {
    if (csvData.length < 2) return [];
    const headers = csvData[0].map(h => h.trim());
    const result = [];

    for (let i = 1; i < csvData.length; i++) {
        const row = csvData[i];
        if (row.length === headers.length || (row.length === 1 && row[0] === '')) {
            if (row.length === 1 && row[0] === '') continue;
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] ? row[index].trim() : '';
            });
            result.push(obj);
        } else {
            console.log("SKIPPING ROW:", row, "Expected headers:", headers.length, "actual:", row.length);
        }
    }
    return { data: result, headers };
};

const str = `Nome,Dupla,Dias_Ativos,Img
Hemerson Farias,A,29,https://ca.slack-edge.com/T05PK3GC291-U05SFN4NU77-9c8d34390296-512
Elisa Murad,A,29,https://ca.slack-edge.com/T05PK3GC291-U06S6EEHZ63-aaa2ec49fd3d-512
Matheus Rosa,B,29,https://ca.slack-edge.com/T05PK3GC291-U06R26ESJFP-e1dad22b5020-512
Miguel Philippi Nobre,B,29,https://ca.slack-edge.com/T05PK3GC291-U0A846JRY4W-10a78364761c-512
Henrique,C,13,https://ca.slack-edge.com/T05PK3GC291-U05RATTR3UY-gfbdae6ba46c-512
Vitor Hugo,C,29,https://ca.slack-edge.com/T05PK3GC291-U05RATTR3UY-gfbdae6ba46c-512
Amanda Marques,D,18,https://ca.slack-edge.com/T05PK3GC291-U08T3ANVBGC-e02c0fed44fc-512
Maria Eduarda Jaruzo,D,8,https://ca.slack-edge.com/T05PK3GC291-U08NYAZ9LRL-6bbd5f944368-512
Felipe Padilha,E,27,https://ca.slack-edge.com/T05PK3GC291-U0A9HCBQGN9-2abaa287f007-512
Nathalia Martini,E,26,https://ca.slack-edge.com/T05PK3GC291-U08LJNN4XHB-249217e21cdf-512
Felipe Moreira,F,20,https://ca.slack-edge.com/T05PK3GC291-U05RATTR3UY-gfbdae6ba46c-512
Suzinny,F,11,https://ca.slack-edge.com/T05PK3GC291-U07AAUG2L8N-496fe63bde83-512
Denize Neres,G,20,https://cdn.gymrats.app/23c1dd0c-9e9a-47d6-a069-da3423d3ef69.jpg
Paloma Passos,G,27,https://ca.slack-edge.com/T05PK3GC291-U09FWUSM8RY-b134f5c9ac21-512
Joao Pedro Corrêa,H,29,https://ca.slack-edge.com/T05PK3GC291-U07H8TEP0NN-a30cd0024b79-512
Sidnei Rodrigues,H,3,https://ca.slack-edge.com/T05PK3GC291-U05R2SJCFRS-23555a12a378-512
kleber,I,10,https://ca.slack-edge.com/T05PK3GC291-U06RSL1SP9V-5f1705a0baa1-512
Willian,I,20,https://ca.slack-edge.com/T05PK3GC291-U08NWSC4CPR-4cb7ae39f9bf-512
Léia,J,2,https://ca.slack-edge.com/T05PK3GC291-U06S7AZCREW-7d076bf3c687-512
Raul Seixas,J,18,https://ca.slack-edge.com/T05PK3GC291-U0A904X7AGG-4b9edcc63df1-512
Andrey Freitas,L,14,https://ca.slack-edge.com/T05PK3GC291-U06U4H3MLQL-908c7554a9c5-512
Luiza Bachmann,L,18,https://ca.slack-edge.com/T05PK3GC291-U09K607Q9N3-b3ba6053abf8-512
Augusto Rodrigues,M,17,https://ca.slack-edge.com/T05PK3GC291-U05RATTR3UY-gfbdae6ba46c-512
Vitoria Pacheco Soares,M,13,https://ca.slack-edge.com/T05PK3GC291-U05RATTR3UY-gfbdae6ba46c-512
Caio,N,16,https://ca.slack-edge.com/T05PK3GC291-U05RATTR3UY-gfbdae6ba46c-512
Carina Casanova Pires,N,9,https://ca.slack-edge.com/T05PK3GC291-U08EQQAGQUF-b9a1d8d0f501-512
Andrew Storniolo,P,28,https://ca.slack-edge.com/T05PK3GC291-U08NLB3SQSZ-69dbc169d8bb-512
Matheus Neiva,P,29,https://cdn.gymrats.app/e063c300-1e8e-49da-9cf4-5c3539cea9fc.jpg
André Matos,Q,29,https://ca.slack-edge.com/T05PK3GC291-U05RATTR3UY-gfbdae6ba46c-512
Henrique Reichert,Q,29,https://ca.slack-edge.com/T05PK3GC291-U09SMKMA4E5-5c0f4dc3bf86-512
Lucas Aguiar,R,29,https://ca.slack-edge.com/T05PK3GC291-U05QH211V7U-588f2c4cab47-512
Luiz Soutes,R,22,https://ca.slack-edge.com/T05PK3GC291-U09MANZHSGK-82ba09b6db35-512
José Eduardo,T,25,https://ca.slack-edge.com/T05PK3GC291-U07N9BVDUCQ-e73ff1fc1e11-512
Lucas Giacomini,T,14,https://ca.slack-edge.com/T05PK3GC291-U060M0M1HGC-8aecdb4a7406-512
D'An,U,29,https://ca.slack-edge.com/T05PK3GC291-U0A9TAAH2HE-3afe78386558-512
Thamara,U,24,https://ca.slack-edge.com/T05PK3GC291-U06JBKBCXNU-6f18271b80da-512
Cecilia,X,7,https://ca.slack-edge.com/T05PK3GC291-U0ACANG991T-2965e6bdf701-512
Daniela de Oliveira,X,5,https://ca.slack-edge.com/T05PK3GC291-U05RATTR3UY-gfbdae6ba46c-512
João Vitor Galarca,Y,4,https://ca.slack-edge.com/T05PK3GC291-U06S9MGT39A-20c0ad1fd627-512
Renato,Y,1,https://media.licdn.com/dms/image/v2/D4D03AQEqe5IOhJmqkA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1708182673064?e=1773878400&v=beta&t=6EzyrBsRn2jBEyRS0zm1BCb0AAYL-4Yst6NlHQ564t8`;

const parsed = parseCSV(str);
const json = csvToJson(parsed);
console.log(json.data.length);
console.dir(json.data.slice(-2), { depth: null });
