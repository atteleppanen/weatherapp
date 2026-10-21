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
async function getWeather(place){
    //create HTML elements and structure. Also add a header
    const div = document.createElement("div");
    div.classList.add(place);
    div.style.display = "flex";
    div.style.flexWrap = "wrap";

    const div2 = document.createElement("div");
    div2.classList.add(`observation`);

    const div3 = document.createElement("div");
    div3.classList.add(`forecast`)

    let makeHeader = document.createElement("h1");
    document.body.append(div);
    div.append(makeHeader);
    makeHeader.style.flexBasis = "100%"
    div.append(div2);
    div.append(div3);

    makeHeader.append(capitalizePlace(place) + ":");

    //capitalises the first letter of the place(mostly to make it the header in HTML)
    function capitalizePlace(name){
        let letters = name.split("");
        let firstBig = letters[0].toUpperCase();
        return firstBig + letters.join("").slice(1)
    }

    //call the function to parse api
    const func = getData(place).then(xmlDoc => {
        const elements  = xmlDoc.getElementsByTagName("BsWfs:BsWfsElement");
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
            const obsP = document.createElement("p");
            div2.append(obsP)
            obsP.append(temps[temps.length+i])

        }

        for(let j = 0; j < 5; j++){
            const forP = document.createElement("p");

            div3.append(forP);
            forP.append("Tähän tulee forecastit");            
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

async function test(){
    const response = await fetch(
        `http://opendata.fmi.fi/wfs?request=getFeature&storedquery_id=fmi::forecast::edited::weather::scandinavia::point::simple&place=jyväskylä`
    )
    text = await response.text()

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml")

    const parameter = xmlDoc.getElementsByTagName("BsWfs:BsWfsElement")

    for(element of parameter){
        // console.log(element)
        // if(element.children[2].textContent == "WeatherSymbol3"){
        //     console.log(element.textContent)
        // }
        for(child of element.children){
            console.log(child.textContent.trim())
        }
        console.log("---------------------")
    }

    /*
    Halutaan parametrejä:
    TotalCloudCover: saadaan pilvisyys - maybe
    Temperature: lämpötila
    WeatherSymbol3
    PoP
    Precipitation1h

    Tahdotaan lisää tietoa:
    PotentialPrecipitationType
    PotentialPrecipitationForm
    Precipitation1h (amount of rain in 1h)
    WeatherSymbol3 (https://en.ilmatieteenlaitos.fi/weather-symbols)
    PoP (probability of precipitation)
    PrecipitationForm
    PrecipitationType
    */
}
 test();

getWeather("jyväskylä");
getWeather("halli");

const formi = document.createElement("form");
const textField = document.createElement("input");
textField.type = "text";
textField.placeholder = "Syötä paikan nimi etsiäksesi säätiedot";
textField.required = true;

const nappi = document.createElement("button");
nappi.type = "submit";
nappi.textContent = "Hae";

formi.append(textField, nappi);
document.body.append(formi);

formi.addEventListener("submit", event =>{
    event.preventDefault();
    getWeather(textField.value.trim());
})

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