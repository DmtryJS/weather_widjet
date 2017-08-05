const {ipcRenderer} = require('electron')

const token = '4c3dc92aab76270ddff54a9fa128abe4',
      city = 'Saransk',
      count = 4, //количество дней
      baseUrl = 'http://api.openweathermap.org/data/2.5/forecast/daily',
      requestString = baseUrl + '?q=' + city + '&APPID=' + token + '&units=metric' + '&cnt=' + count,
      updateInterval = 10 * 1000 * 60; // первая цифра задается в минутах (сейчас 10 минут). 

var vue_app = new Vue({
   	          el: '#app',
   	          data: {
  	             city: city,
  	             today_temp: '',
  	             clouds: '',
  	             winds: '',
  	             description: '',
                 days: [],
                 show: false,
                 today_weather_icon: ""
   	            },
              
              methods: {

                getData: function () {
                    var a = this;
                    axios.get(requestString)
                          .then(function (response) {
                              a.render(response.data);
                          })
                          .catch(function (error) {
                              console.log(error);
                          });
                }, 

                formatData: function(timestamp)
                {
                    var ts = timestamp * 1000,
                    date = new Date(ts),
                    year = date.getFullYear(),
                    m = date.getMonth() + 1,
                    d = date.getDate();
                    
                    return d + '.' + m + '.' + year;
                },

                render: function(data)
                {
                    var d = data.list;
                    this.show = true;
                    this.city_name = data.city.name;
                    this.today_temp = Math.round(d[0].temp.day * 10) / 10;
                    this.clouds = d[0].weather[0].main;
                    this.winds = 'Ветер: ' + d[0].speed + ' m/s Давление: ' + d[0].pressure;
                    this.today_weather_icon = 'wi wi-' + d[0].weather[0].icon;
                    this.description = d[0].weather[0].description;
                    this.days = data.list.splice(1,  count); //удаляем из отрисовки 1 сегодняшний день, он и так отображается отдельно.
                    
                    let toApp = { 'icon': d[0].weather[0].icon,
                                  'today_temp': this.today_temp};
                    ipcRenderer.send('updateTrayIconEvent', toApp);
                },

                hideEvent: function()
                {
                    ipcRenderer.send('hideEvent');
                }
          },

                mounted() {
                    this.getData();
                }
  	 });

//периодическое обновление погоды
setInterval(vue_app.getData, updateInterval);