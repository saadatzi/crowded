        var timeFormat = 'YYYY/MM/DD';

		function randomScalingFactor() {
			const newData = Math.round(Math.random() * 100 );
			console.warn("<<<<<<<<<<<<<<<<<newDate: ", newData);

			return newData
		}

		function newDate(days) { 
            return moment().add(days, "d").toDate();
        }

		function newDateString(days) {
			const newDate = moment().subtract(days, "d").format(timeFormat);
			console.warn(">>>>>>>>>>>>>>>>>>>>>>>>> newDate: ", newDate);
            return newDate
        }

        function newTimestamp(days) {
            return moment().add(days, "d").unix();
        }
        const ctx = document.getElementById('canvas').getContext('2d');

        var gradientStroke = ctx.createLinearGradient(1000, 0, 100, 0);
        gradientStroke.addColorStop(0, '#FF4500');
        gradientStroke.addColorStop(1, '#FFD700	');

		var myChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: [newDate(0), newDate(1), newDate(2), newDate(3), newDate(4), newDate(5), newDate(6)], // Date Objects
				datasets: [{
                    label: 'Dataset with point data',
					borderColor: gradientStroke,
                    borderWidth: 30,
                    pointHoverBackgroundColor: gradientStroke,
                    pointHoverRadius: 10,
                    pointHoverBorderWidth: 1,
					pointRadius: 0,
                    fill: false,
					data: [{
						x: newDateString(0),
                        y: randomScalingFactor()
					}, {
						x: newDateString(5),
						y: randomScalingFactor()
					}, {
						x: newDateString(7),
						y: randomScalingFactor()
					}, {
						x: newDateString(15),
						y: randomScalingFactor()
					}, {
						x: newDateString(17),
						y: randomScalingFactor()
					}, {
						x: newDateString(19),
						y: randomScalingFactor()
					}, {
						x: newDateString(21),
						y: randomScalingFactor()
					}, {
						x: newDateString(27),
						y: randomScalingFactor()
					}, {
						x: newDateString(34),
						y: randomScalingFactor()
					}, {
						x: newDateString(38),
						y: randomScalingFactor()
					}],
				}]
			},
			options: {
				legend: {
					display: false,
				},
				responsive: true,
				scales: {
					xAxes: [{
						type: 'time',
						time: {
                            unit: 'day',
							parser: timeFormat,
							tooltipFormat: 'll'
						},
						gridLines: {
							display:true,
							color: "black",
							lineWidth: 0.1
						}
					}],
					yAxes: [{
						gridLines: {
							display: false,
						}
					}]
				},				
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x'
                        },
                    }
                }
			}
		});
