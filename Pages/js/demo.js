$(function () {
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    var uuid = localStorage.getItem("uuid");
    if (!uuid) {
        uuid = uuidv4();
        localStorage.setItem("uuid", uuidv4());
    }

    console.log(uuid);

    var tmp_dataset = {};
    var active_year = 0;

    function replot() {
        var mont_dict = {
            "01": "Jan",
            "02": "Feb",
            "03": "Mar",
            "04": "Apr",
            "05": "May",
            "06": "Jun",
            "07": "Jul",
            "08": "Aug",
            "09": "Sep",
            "10": "Oct",
            "11": "Nov",
            "12": "Dec"
        };

        var mont_list = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ];

        $.ajax({
            type: 'GET',
            url: 'https://42q6iw44o2.execute-api.ap-southeast-1.amazonaws.com/api/transactions/' + uuid,
            dataType: "text",
            success: function (data) {
                tmp_dataset = {};
                var parsedCSV = d3.csvParseRows(data);
                parsedCSV.shift();
                for (var idx in parsedCSV) {
                    var cells = parsedCSV[idx];
                    var year = cells[5].split("-")[0];
                    var month = mont_dict[cells[5].split("-")[1]];
                    var category = cells[6];
                    if (!tmp_dataset[year]) {
                        tmp_dataset[year] = {}
                    }
                    if (!tmp_dataset[year][month]) {
                        tmp_dataset[year][month] = {}
                    }
                    if (!tmp_dataset[year][month][category]) {
                        tmp_dataset[year][month][category] = 0
                    }
                    var money = parseFloat(cells[3].replace(',', '').replace('CR', '').replace(' ', ''));
                    tmp_dataset[year][month][category] += money;
                }

                d3.select("#years_button").selectAll("*").remove();
                Object.keys(tmp_dataset).forEach(function (key) {
                    d3.select("#years_button").append("button").attr("class", "btn btn-default btn-active-purple").attr("name", "year_button_i").text(key);
                });
                $("button[name='year_button_i']").click(function () {
                    $("button[name='year_button_i']").removeClass("active");
                    $(this).addClass("active");
                    active_year = $(this).text();
                    var month_list = d3.select("#month_list");
                    month_list.selectAll("li").remove();
                    var tmp = tmp_dataset[active_year];
                    for (var month in mont_list) {
                        if (mont_list[month] in tmp) {
                            month_list.append("li").append('a').attr("name", "tabs_month").attr("data-toggle", 'tab').text(mont_list[month]).on('click', rebuild);
                        }
                    }
                });


            }
        });


    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }


    function rebuild() {
        var current_year = active_year;
        if (!tmp_dataset[current_year] || !tmp_dataset[current_year][this.text]) {
            d3.select("#head_of_chart").text("No data");
            d3.select("#panel_bar").selectAll("*").remove();
            d3.select("#demo-flot-donut").selectAll("*").remove();
            return;
        }

        d3.select("#head_of_chart").text("Rate of Each Category");
        var tmp = tmp_dataset[current_year][this.text];
        var chart_data = [];
        var panel_bar = d3.select("#panel_bar");
        panel_bar.selectAll("*").remove();
        var total_money = 0;
        Object.keys(tmp).forEach(function (key) {
            total_money += parseFloat(tmp[key])
        });


        Object.keys(tmp).forEach(function (key) {
            var color = getRandomColor();
            // data for pie chart
            chart_data.push({label: key, data: tmp[key].toFixed(2), color: color});
            var percent = (parseFloat(tmp[key]) / total_money * 100);
//                        if (percent <= 10) {
//                            return;
//                        }
            percent = percent.toFixed(2) + "%";
            // rebuild progress bar
            panel_bar.append("p").text(key + "  $ " + tmp[key].toFixed(2));
            panel_bar.append("div").attr("class", "progress").append("div").style("width", percent).style("background-color", color).attr("class", "progress-bar progress-bar-info");
        });

        // rebuild pie chart
        $.plot('#demo-flot-donut', chart_data, {
            series: {
                pie: {
                    show: true,
                    combine: {
                        color: '#999',
                        threshold: 0.1
                    }
                }
            },
            legend: {
                show: false
            }
        });

    };

    replot();


    var categories = ["Credit Card Payment",
        "Restaurants",
        "Veterinary",
        "Life Insurance",
        "Vacation",
        "Air Travel",
        "Shopping",
        "Rental Car & Taxi",
        "Hotel",
        "Gym",
        "Income",
        "Electronics & Software",
        "Coffee Shops",
        "Parking",
        "Groceries",
        "Delivery",
        "Pet Food & Supplies",
        "Mobile Phone",
        "Personal Care",
        "Furnishings",
        "Utilities",
        "Service Fee",
        "Fast Food",
        "Food & Dining",
        "Sports",
        "Shipping",
        "Transfer",
        "Amusement",
        "Bank Fee",
        "Late Fee",
        "Clothing",
        "Arts",
        "Uncategorized",
        "Returned Purchase",
        "Home Improvement",
        "Music",
        "Interest Income",
        "Bonus",
        "Doctor",
        "Travel Insurance",
        "Public Transportation",
        "Tuition",
        "Lawn & Garden",
        "Alcohol & Bars",
        "Education",
        "Home Services",
        "ental Car & Taxi",
        "Movies & DVDs",
        "Home Supplies",
        "Dentist",
        "Entertainment",
        "Gas & Fuel",
        "Gift",
        "Printing",
        "Travel"];

    var data = ",Unnamed: 0,date,description,amount,foreign_amount,statement_date,category\n" +
        "0,0,02 AUG,30 JUL NTUC FP-CITY SQUARE SINGAPORE,46.75,,2017-08-27 00:00:00,Groceries\n" +
        "1,1,05 AUG,02 AUG TIM HO WAN @ 112 KATONG SINGAPORE,45.79,,2017-08-27 00:00:00,Restaurants\n" +
        "2,2,07 AUG,03 AUG YAYOI JAPANESE RESTAURANTSINGAPORE,76.62,,2017-08-27 00:00:00,Restaurants\n";

    Dropzone.options.data = {
        paramName: 'file',
        maxFilesize: 20, // MB
        maxFiles: 3,
        timeout: 60000,
        dictDefaultMessage: 'Drag an image here to upload, or click to select one',
        uploadMultiple: false,
        autoProcessQueue: true,
        headers: {
            //'x-csrf-token': document.querySelectorAll('meta[name=csrf-token]')[0].getAttributeNode('content').value,
        },
        acceptedFiles: '.pdf',
        init: function () {
            this.on('success', function (file, resp) {
                d3.select("#Statements_panel").style("display", "block");
                d3.select("#submit_alert").style("display", "none");
                d3.select("#table_div").selectAll("*").remove();
                var data = resp.csv;
                console.log(data);
                var parsedCSV_o = d3.csvParseRows(data);
                var parsedCSV = d3.csvParseRows(data);

                for (var idx in parsedCSV) {
//                parsedCSV[idx].shift();
                    parsedCSV[idx].shift();
//                categories.push(parsedCSV[idx].pop())
                }

                var table = d3.select("#table_div").append("table").attr("class", "table table-striped table-bordered");

                var tbody = table.append("tbody");
                var thead = table.append('thead');

                var columns = parsedCSV.shift();


                // append the header row
                thead.append('tr')
                    .selectAll('th')
                    .data(columns).enter()
                    .append('th')
                    .text(function (column) {
                        return column;
                    });


                // create a row for each object in the data
                var rows = tbody.selectAll('tr')
                    .data(parsedCSV)
                    .enter()
                    .append('tr');

                // create a cell in each row for each column
                var cells = rows.selectAll('td')
                    .data(function (row) {
                        return columns.map(function (column) {
                            var value = row.shift();
                            if (column === "category") {
                                var select_html = '<select data-placeholder="Choose a Category..." name="demo-chosen-select">\n';
                                for (idx in categories) {
                                    if (value === categories[idx]) {
                                        select_html += '<option value="' + categories[idx] + '" selected="selected">' + categories[idx] + '</option>\n'
                                    } else {
                                        select_html += '<option value="' + categories[idx] + '">' + categories[idx] + '</option>\n'
                                    }
                                }
                                select_html += '</select>\n';
                                return {
                                    column: column,
                                    value: select_html
                                };

                            } else {
                                return {column: column, value: value};
                            }
                        });
                    })
                    .enter()
                    .append('td')
                    .html(function (d) {
                        return d.value;
                    });

                $("select[name='demo-chosen-select']").chosen();

                d3.select("#submit_api2").on('click', function () {
                    var category = [];
                    $("select[name='demo-chosen-select'] option:selected").each(function () {
                        category.push($(this).text())
                    });

                    for (var idx in parsedCSV_o) {
                        if (idx === "0") continue;
                        parsedCSV_o[idx].pop();
                        parsedCSV_o[idx].push(category.pop())
                    }
                    var new_csv = d3.csvFormat(parsedCSV_o);
                    var new_csv_a = new_csv.split("\n");
                    var new_csv_f = "";
                    for (idx in new_csv_a) {
                        if (idx === "0") continue;
                        new_csv_f += new_csv_a[idx] + "\n";
                    }
                    $.ajax({
                        type: 'POST',
                        url: 'https://42q6iw44o2.execute-api.ap-southeast-1.amazonaws.com/api/confirm',
                        dataType: "text",
                        data: {
                            'uuid': uuid,
                            'file': new_csv_f
                        },
                        success: function (data) {
                            d3.select("#Statements_panel").style("display", "none");
                            d3.select("#submit_alert").style("display", "block");
                            replot();
                        }
                    });
                });
            });
            this.on("sending", function (file, xhr, formData) {
                // Will send the filesize along with the file as POST data.
                formData.append("filesize", file.size);
            });
        }
    };
});
