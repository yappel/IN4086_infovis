import BaseVisualisation from './basevisualisation.js';

/**
 * Statistics view which provides some basic information on the complete data set and 
 * the filtered selection of the data set.
 */
class StatisticsView extends BaseVisualisation {
    /**
     * Constructor for the StatisticsView. Appends two divs one for the statistics of the complete 
     * dataset and one for the statistics of the filtered selection. Each div contains a table with 
     * headers and data entries row for the statistic values.
     * @param {*} root - The root html element the visualisation can use
     * @param {*} filterChangedCallback - The function to call when the visualisations filter has changed
     */
    constructor(root, filterChangedCallback) {
        super(root, filterChangedCallback);
        this.dataset_view = this.root.append("div");
        this.dataset_view.style("padding", "10px");
        this.dataset_view.append("h2")
            .text("Complete Dataset")
            .style("margin-top", "0px")
            .style("margin-bottom", "5px");
        this.filtered_view = this.root.append("div");
        this.filtered_view.style("padding", "10px");
        this.filtered_view.append("h2")
            .text("Filtered Dataset")
            .style("margin-top", "0px")
            .style("margin-bottom", "5px");
        this.initStatistics(this.dataset_view);
        this.initStatistics(this.filtered_view);
    }

    update(data, filtered_data, data_has_changed = false) {
        super.update(data, filtered_data, data_has_changed);
        this.updateStatistics(this.dataset_view, this.data);
        this.updateStatistics(this.filtered_view, this.filtered_data);
    }

    /**
     * Initialises an HTML selection for statistics by adding a table with labeled 
     * data entry rows.
     * @param {Object} root - The selection to which the table can be added 
     */
    initStatistics(root) {
        var table = root.append("table");
        table
            .style("width", "100%")
            .style("border", "1px solid white")
            .style("border-collapse", "collapse")
        var header = table.append("thead").append("tr");
        header.append("th").text("Total number of posts");
        header.append("th").text("Number of distinct post creators");
        header.append("th").text("Start date");
        header.append("th").text("End date");
        this.applyRowStyle(header, "th");
        var body = table.append("tbody").append("tr");
        body.append("td").attr("class", "post_total");
        body.append("td").attr("class", "user_total");
        body.append("td").attr("class", "start_date");
        body.append("td").attr("class", "end_date");
        this.applyRowStyle(body, "td");
    }

    /**
     * Applies a style to table header and table body element nodes.
     * @param {Object} root - The parent element where all the id elements are in
     * @param {String} id - The id's to apply the style to
     */
    applyRowStyle(root, id) {
        root.selectAll(id)
            .style("padding", "5px")
            .style("border", "1px solid white")
            .style("text-align", "center")
    }

    /**
     * Updates the values in the statistcs table based on the provided data.
     * @param {Object} root - The parent element where the table for the statistics is in.
     * @param {Object[]} data - The data to compute the statisics for
     */
    updateStatistics(root, data) {
        root.selectAll(".post_total")
            .text(data.length);
        root.selectAll(".user_total")
            .text(d3.nest().key(d => d.OwnerUserId).entries(data).length)
        root.selectAll(".start_date")
            .text(d3.min(data, d => d.CreationDate));
        root.selectAll(".end_date")
            .text(d3.max(data, d => d.CreationDate));
    }
}

export default StatisticsView;