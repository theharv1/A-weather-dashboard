// API key
let apiKey = "f3430785ac69cb99629c6575bcb7d061";
let searchBtn = $(".searchBtn");
let searchInput = $(".searchInput");

// Left column locations
let cityNameEl = $(".cityName");
let currentDateEl = $(".currentDate");
let weatherIconEl = $(".weatherIcon");
let searchHistoryEl = $(".historyItems");

// Right column locations
let tempEl = $(".temp");
let humidityEl = $(".humidity");
let windSpeedEl = $(".windSpeed");
let uvIndexEl = $(".uvValue");
let cardRow = $(".card-row");

// Create a current date variable
var today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0');
let yyyy = today.getFullYear();
var today = yyyy + '-' + mm + '-' + dd;

// local storage, search history  
if (JSON.parse(localStorage.getItem("searchHistory")) !== null) {
    renderSearchHistory();
}
// search button
searchBtn.on("click", function(e) {
    e.preventDefault();
    if (searchInput.val() === "") {
        alert("You must enter a city name");
        return;
    }
    getWeather(searchInput.val());
    searchInput.val("");
});

$(document).on("click", ".historyEntry", function() {
    let thisElement = $(this);
    getWeather(thisElement.text());
})

$(document).ready(function() {
    console.log($(".historyItems li:eq(0)").text());
    if($(".historyItems li:eq(0)").text()!=="")
        getWeather($(".historyItems li:eq(0)").text());
    else
        getWeather("ottawa");
})

// renders search history
function renderSearchHistory(cityName) {
    searchHistoryEl.empty();
    let searchHistoryArr = JSON.parse(localStorage.getItem("searchHistory"));
    for (let i = 0; i < searchHistoryArr.length; i++) {
        let newListItem = $("<li>").attr("class", "historyEntry");
        newListItem.text(searchHistoryArr[i]);
        searchHistoryEl.prepend(newListItem);
    }
}
// gets the data for the following
function renderWeatherData(cityName, cityTemp, cityHumidity, cityWindSpeed, cityWeatherIcon, uvVal) {
    cityNameEl.text(cityName)
    currentDateEl.text(`(${today})`)
    tempEl.text(`Temperature: ${cityTemp} °C`);
    humidityEl.text(`Humidity: ${cityHumidity}%`);
    windSpeedEl.text(`Wind Speed: ${cityWindSpeed} km/h`);

    if(uvVal < 5){
        uvIndexEl.addClass("favorable");
        uvIndexEl.removeClass("moderate");
        uvIndexEl.removeClass("severe");
    }
    else if(uvVal < 8){
        uvIndexEl.addClass("moderate");
        uvIndexEl.removeClass("favorable");
        uvIndexEl.removeClass("severe");
    }
    else{
        uvIndexEl.addClass("severe");
        uvIndexEl.removeClass("moderate");
        uvIndexEl.removeClass("favorable");
    }
    uvIndexEl.text(`${uvVal}`);
    weatherIconEl.attr("src", cityWeatherIcon);
}
// gets weather for desired city
function getWeather(desiredCity) {
    let queryUrl = `https://api.openweathermap.org/data/2.5/weather?q=${desiredCity}&APPID=${apiKey}&units=metric`;
    $.ajax({
        url: queryUrl,
        method: "GET",
        success: function(weatherData) {
            let cityObj = {
                cityName: weatherData.name,
                cityTemp: weatherData.main.temp,
                cityHumidity: weatherData.main.humidity,
                cityWindSpeed: weatherData.wind.speed,
                cityUVIndex: weatherData.coord,
                cityWeatherIconName: weatherData.weather[0].icon
            }
            let queryUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${cityObj.cityUVIndex.lat}&lon=${cityObj.cityUVIndex.lon}&APPID=${apiKey}&units=metric`
            $.ajax({
                url: queryUrl,
                method: 'GET',
                success: function(uvData) {
                    if (JSON.parse(localStorage.getItem("searchHistory")) == null) {
                        let searchHistoryArr = [];
                        if (searchHistoryArr.indexOf(cityObj.cityName) === -1) {
                            searchHistoryArr.push(cityObj.cityName);
                            localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
                            let renderedWeatherIcon = `https:///openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                            renderWeatherData(cityObj.cityName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
                            renderSearchHistory(cityObj.cityName);
                        }
                        else {
                            let renderedWeatherIcon = `https:///openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                            renderWeatherData(cityObj.cityName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
                        }
                    }
                    else {
                        let searchHistoryArr = JSON.parse(localStorage.getItem("searchHistory"));
                        if (searchHistoryArr.indexOf(cityObj.cityName) === -1) {
                            searchHistoryArr.push(cityObj.cityName);
                            localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
                            let renderedWeatherIcon = `https:///openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                            renderWeatherData(cityObj.cityName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
                            renderSearchHistory(cityObj.cityName);
                        }
                        else {
                            let renderedWeatherIcon = `https:///openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                            renderWeatherData(cityObj.cityName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
                        }
                    }
                },
                // alert for input of an invalid city
                error: function() {
                    alert("The city name is invalid. Please enter a valid city name.");
                    getWeather($(".historyItems li:eq(0)").text());
                    return false;
                }
            });
        },
        error: function() {
            alert("The city name is invalid. Please enter a valid city name.");
            getWeather($(".historyItems li:eq(0)").text());
            return false;
        }
    });

    getFiveDayForecast();
// five day forecast 
    function getFiveDayForecast() {
        cardRow.empty();
        let queryUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${desiredCity}&APPID=${apiKey}&units=metric`;
        $.ajax({
            url: queryUrl,
            method: "GET",
            success: function(fiveDayReponse) {
                for (let i = 0; i != fiveDayReponse.list.length; i+=8 ) {
                    let cityObj = {
                        date: fiveDayReponse.list[i].dt_txt,
                        icon: fiveDayReponse.list[i].weather[0].icon,
                        temp: fiveDayReponse.list[i].main.temp,
                        humidity: fiveDayReponse.list[i].main.humidity
                    }
                    let dateStr = cityObj.date;
                    let trimmedDate = dateStr.substring(0, 10); 
                    let weatherIco = `https:///openweathermap.org/img/w/${cityObj.icon}.png`;
                    createForecastCard(trimmedDate, weatherIco, cityObj.temp, cityObj.humidity);
                }
            },
            error: function() {
                return false;
            }
        });
    }   
}
// creates the 5 days forecast cards
function createForecastCard(date, icon, temp, humidity) {

    
    let fiveDayCardEl = $("<div>").attr("class", "five-day-card");
    let cardDate = $("<h3>").attr("class", "card-text");
    let cardIcon = $("<img>").attr("class", "weatherIcon");
    let cardTemp = $("<p>").attr("class", "card-text");
    let cardHumidity = $("<p>").attr("class", "card-text");

    cardRow.append(fiveDayCardEl);
    cardDate.text(date);
    cardIcon.attr("src", icon);
    cardTemp.text(`Temp: ${temp} °C`);
    cardHumidity.text(`Humidity: ${humidity}%`);
    fiveDayCardEl.append(cardDate, cardIcon, cardTemp, cardHumidity);
}