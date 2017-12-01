/**
 * Base class for all visualisations.
 */
class BaseVisualisation {
    /**
     * Base constructor
     * @param {*} root - The root html element the visualisation can use
     * @param {Object[]} data - The collection of data
     */
    constructor(root, data) {
        this.root = root;
        this.data = data;
        this.filtered_data = data;
    }

    /**
     * 
     * @param {Object[]} data - The collection of data
     * @param {Object[]} filtered_data - The collection of filtered data
     */
    update(data, filtered_data) {
        this.data = data;
        this.filtered_data = filtered_data;
    }

    /**
     * 
     * @param {Object[]} data - The data to filter
     * @returns {Object[]} - The filtered data from the visualisation
     */
    filter(data) {
        return data;
    }
}

export default BaseVisualisation;