import BaseVisualisation from "./basevisualisation.js";

class TagGraph extends BaseVisualisation {

    constructor(root, data, options) {
        super(root, data);
        this.options = {
            width: 300,
            height: 300
        };
        Object.assign(this.options, options);
        this.svg = root.append("svg")
            .attr("width", this.options.height)
            .attr("height", this.options.width);
    }

    update(data, filtered_data, data_has_changed = false) {
        super.update(data, filtered_data, data_has_changed);
        // TODO: visualisation
    }

    filter(data) {
        // TODO: filtering
        return data;
    }
}

export default TagGraph;