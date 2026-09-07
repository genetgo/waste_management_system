const collectorRepository = require("../repositories/collectorRepository");


// =================================
// Create Collector
// =================================
const createCollector = async (data) => {

    return await collectorRepository.createCollector(data);

};


// =================================
// Get All Collectors
// =================================
const getCollectors = async () => {

    return await collectorRepository.getAllCollectors();

};


// =================================
// Get Collector By ID
// =================================
const getCollectorById = async (id) => {

    const collector =
        await collectorRepository.getCollectorById(id);


    if (!collector) {
        throw new Error("Collector not found.");
    }


    return collector;

};


// =================================
// Update Collector
// =================================
const updateCollector = async (id, data) => {

    return await collectorRepository.updateCollector(
        id,
        data
    );

};


// =================================
// Delete Collector
// =================================
const deleteCollector = async (id) => {

    return await collectorRepository.deleteCollector(id);

};


// =================================
// Activate / Deactivate
// =================================
const updateCollectorStatus = async (
    id,
    is_active
) => {

    return await collectorRepository.updateCollectorStatus(
        id,
        is_active
    );

};


// =================================
// Search Collectors
// =================================
const searchCollectors = async(keyword)=>{

    return await collectorRepository.searchCollectors(
        keyword
    );

};


// =================================
// Collector Dashboard
// =================================
const getDashboard = async(collectorId)=>{

    return await collectorRepository.getCollectorDashboard(
        collectorId
    );

};


// =================================
// Assigned Collections
// =================================
const getAssignedRequests = async(collectorId)=>{

    return await collectorRepository.getAssignedRequests(
        collectorId
    );

};


// =================================
// Update Request Status
// =================================
const updateRequestStatus = async(
    requestId,
    collectorId,
    status
)=>{


    return await collectorRepository.updateRequestStatus(
        requestId,
        collectorId,
        status
    );


};
// =================================
// Start Collection
// =================================
const startCollection = async(
    requestId,
    collectorId
)=>{

    const result =
        await collectorRepository.startCollection(
            requestId,
            collectorId
        );


    if(!result){
        throw new Error(
            "Unable to start collection."
        );
    }


    return result;

};



// =================================
// Complete Collection
// =================================
const completeCollection = async(
    requestId,
    collectorId
)=>{

    const result =
        await collectorRepository.completeCollection(
            requestId,
            collectorId
        );


    if(!result){
        throw new Error(
            "Unable to complete collection."
        );
    }


    return result;

};

// =================================
// Collector Schedules
// =================================
const getCollectorSchedules = async(
    collectorId
)=>{


    return await collectorRepository.getCollectorSchedules(
        collectorId
    );


};


// =================================
// Count Collectors
// =================================
const countCollectors = async()=>{


    return await collectorRepository.countCollectors();


};



module.exports = {

    createCollector,
    getCollectors,

    getCollectorById,

    updateCollector,

    deleteCollector,

    updateCollectorStatus,

    searchCollectors,

    getDashboard,

    getAssignedRequests,

    updateRequestStatus,
 startCollection,
    completeCollection,
    getCollectorSchedules,

    countCollectors

};