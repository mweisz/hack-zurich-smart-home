function showLightingChart() {
 Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });

        $('#container').highcharts({
            chart: {
                type: 'spline',
                animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
                events: {
                    load: function () {

                        // set up the updating of the chart each second
                        var series0 = this.series[0];
                        var series1 = this.series[1];
                        setInterval(function () {
                            var x = (new Date()).getTime(), // current time
                                y = Math.random();
                            // series.addPoint([x, y], true, true);
                            series0.setData(historicSumOfLights, true)
                    
                            var liveSumOfLights = [Array.apply(null, Array(minute)).map(Number.prototype.valueOf,0)];

                            for (var i = 0; i < minute; i++) {
                                liveSumOfLights[i] = liveLightData[0][i] + liveLightData[1][i] + liveLightData[2][i] + liveLightData[3][i];
                            }
                            series1.setData(liveSumOfLights, true)
                        }, 1000);
                    }
                }
            },
            title: {
                text: '# Of Light Sources'
            },
            xAxis: {
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: 'Value'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, 2);
                }
            },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
            exporting: {
                enabled: false
            },
            series: [{
                name: 'Normal Usage',
                data: historicSumOfLights
            },
            {
                name: 'Current Usage',
                data: []
            }]
        });
}