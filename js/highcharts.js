function showLightingChart() {
        $('#container').highcharts({
        title: {
            text: 'Lighting',
            x: -40 //center
        },
        xAxis: {
            // categories: ['0', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            //     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'Number of Light Sources'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        // tooltip: {
        //     valueSuffix: '°C'
        // },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'Average # of light sources',
            data: [0, 0, 0, 0, 1, 1, 2, 2, 1, 3, 3, 2, 1, 0, 0, 0]
        },{
            name: 'Current # of light sources',
            data: [0, 0, 0, 0, 1, 1, 3, 4, 4, 4, 4, 4, 2, 1, 0, 0]
        }]
    });
}