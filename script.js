//async tells the code this is not instant
async function getData(place){
    //await tells the code this is not instant
    //getting response from the api
    const response = await fetch(
        `https://opendata.fmi.fi/wfs?request=getFeature&storedquery_id=fmi::observations::weather::simple&place=${place}`
    );

    //this is the raw xml file
    const text = await response.text()

    //using DOMparser to turn the xml into a dom file
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml")

    return xmlDoc;
};

//function to create a place for HTML
function getWeather(place){
    //call the function to parse api
    const func = getData(place).then(xmlDoc => {
        //create HTML elements and write the header for place
        const elements  = xmlDoc.getElementsByTagName("BsWfs:BsWfsElement");
        const div = document.createElement("div");
        let makeHeader = document.createElement("h1");
        document.body.append(div);
        div.append(makeHeader);
        makeHeader.append(capitalizePlace(place) + ":");

        //capitalises the first letter of the place(mostly to make it the header in HTML)
        function capitalizePlace(name){
            let letters = name.split("");
            let firstBig = letters[0].toUpperCase();
            return firstBig + letters.join("").slice(1)
        }

        let temps = [];
        let last = "";

        //loop trough data to find temp and time
        for(const element of elements){
            if (element.getElementsByTagName("BsWfs:ParameterName")[0].textContent == "t2m"){
                const dataType = element.getElementsByTagName("BsWfs:ParameterName")[0].textContent;
                const temp = element.getElementsByTagName("BsWfs:ParameterValue")[0].textContent;
                const time = parseTime(element.getElementsByTagName("BsWfs:Time")[0].textContent);
                last = `${time}: ${temp}\u00B0C`;
                temps.push(last);
            }
        }
        
        //put last 3 observations to HTML
        for(let i = -1; i > -4; i--){
            const makeP = document.createElement("p");

            div.append(makeP)
            makeP.append(temps[temps.length+i])
        }
    });
}

function parseTime(rawTime){
    const dateTime = rawTime.split("T");
    const date = dateTime[0].split("-").reverse().join(".").slice(0, 6);
    const time = dateTime[1].slice(0,5);

    //convert time to gmt+3
    const gmtPlus3 = parseInt(time.slice(0, 2)) + 3;
    const newTime = gmtPlus3.toString() + time.slice(2);

    return `${date} klo:${newTime}`
}

getWeather("jyväskylä");
getWeather("halli");
getWeather("lappeenranta");










/*
<wfs:member>
    <BsWfs:BsWfsElement gml:id="BsWfsElement.1.35.1">
        <BsWfs:Location>
            <gml:Point gml:id="BsWfsElementP.1.35.1" srsDimension="2" srsName="http://www.opengis.net/def/crs/EPSG/0/4258">
            <gml:pos>62.39332 25.68862 </gml:pos>
            </gml:Point>
        </BsWfs:Location>
        <BsWfs:Time>2026-10-17T10:20:00Z</BsWfs:Time>
        <BsWfs:ParameterName>t2m</BsWfs:ParameterName>
        <BsWfs:ParameterValue>8.2</BsWfs:ParameterValue>
    </BsWfs:BsWfsElement>
</wfs:member>
*/