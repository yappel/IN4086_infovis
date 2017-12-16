/**
 * Base class for all visualisations.
 */
class BaseVisualisation {
    /**
     * Base constructor
     * @param {*} root - The root html element the visualisation can use
     * @param {*} filterChangedCallback - The function to call when the visualisations filter has changed
     */
    constructor(root, filterChangedCallback) {
        this.root = root;
        this.callback = filterChangedCallback;
        this.data = [];
        this.filtered_data = [];
    }

    /**
     * Base update function, called when the visualisation needs to be updated as the data 
     * has changed or the filtered data has changed.
     * @param {Object[]} data - The collection of data
     * @param {Object[]} filtered_data - The collection of filtered data
     * @param {boolean} data_has_changed - Boolean indicating if the data has been changed from last time
     */
    update(data, filtered_data, data_has_changed = false) {
        if (data_has_changed) {
            this.data = data;
        }
        this.filtered_data = filtered_data;
    }

    /**
     * Filter function which filters out the data which is excluded based on the filters selection.
     * @param {Object[]} data - The data to filter
     * @returns {Object[]} - The filtered data from the visualisation
     */
    filter(data) {
        return data;
    }

    /**
     * Called when the filter has changed.
     */
    filterChanged(initiator) {
        this.callback(initiator);
    }
}

export default BaseVisualisation;