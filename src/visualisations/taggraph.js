import BaseVisualisation from "./basevisualisation.js";

class TagGraph extends BaseVisualisation {

    constructor(root, data, options) {
        super(root, data);
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