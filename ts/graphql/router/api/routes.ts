import { Router } from 'express';

const router = Router({
  strict: true,
  caseSensitive: true
});

import { Router404Controller } from '@/graphql/controllers/Router404Controller';

import { CreateCostCenterController } from '@/graphql/controllers/CreateCostCenterController';
import { UpdateCostCenterController } from '@/graphql/controllers/UpdateCostCenterController';
import { FindCostCenterController } from '@/graphql/controllers/FindCostCenterController';
import { FindAllCostCenterController } from '@/graphql/controllers/FindAllCostCenterController';
import { DeleteCostCenterController } from '@/graphql/controllers/DeleteCostCenterController';

import { CreateScaleController } from '@/graphql/controllers/CreateScaleController';
import { UpdateScaleController } from '@/graphql/controllers/UpdateScaleController';
import { FindScaleController } from '@/graphql/controllers/FindScaleController';
import { findAllScalesController } from '@/graphql/controllers/FindAllScalesController';
import { DeleteScaleController } from '@/graphql/controllers/DeleteScaleController';

import { CreateServiceController } from '@/graphql/controllers/CreateServiceController';
import { UpdateServiceController } from '@/graphql/controllers/UpdateServiceController';
import { AssignPersonServiceController } from '@/graphql/controllers/AssignPersonServiceController';
import { AssignWorkplaceServiceController } from '@/graphql/controllers/AssignWorkplaceServiceController';
import { UnassignPersonServiceController } from '@/graphql/controllers/UnassignPersonServiceController';
import { FindServiceController } from '@/graphql/controllers/FindServiceController';
import { FindAllServicesController } from '@/graphql/controllers/FindAllServicesController';
import { DeleteServiceController } from '@/graphql/controllers/DeleteServiceController';

import { CreateReasonForAbsenceController } from '@/graphql/controllers/CreateReasonForAbsenceController';
import { UpdateReasonForAbsenceController } from '@/graphql/controllers/UpdateReasonForAbsenceController';
import { FindAllReasonForAbsenceController } from '@/graphql/controllers/FindAllReasonForAbsenceController';
import { FindReasonForAbsenceController } from '@/graphql/controllers/FindReasonForAbsenceController';
import { DeleteReasonForAbsenceController } from '@/graphql/controllers/DeleteReasonForAbsenceController';

import { CreateStreetController } from '@/graphql/controllers/CreateStreetController';
import { UpdateStreetController } from '@/graphql/controllers/UpdateStreetController';
import { FindStreetController } from '@/graphql/controllers/FindStreetController';
import { FindAllStreetsController } from '@/graphql/controllers/FindAllStreetsController';
import { DeleteStreetController } from '@/graphql/controllers/DeleteStreetController';

import { CreateNeighborhoodController } from '@/graphql/controllers/CreateNeighborhoodController';
import { UpdateNeighborhoodController } from '@/graphql/controllers/UpdateNeighborhoodController';
import { FindNeighborhoodController } from '@/graphql/controllers/FindNeighborhoodController';
import { FindAllNeighborhoodsController } from '@/graphql/controllers/FindAllNeighborhoodsController';
import { DeleteNeighborhoodController } from '@/graphql/controllers/DeleteNeighborhoodController';

import { CreateCityController } from '@/graphql/controllers/CreateCityController';
import { UpdateCityController } from '@/graphql/controllers/UpdateCityController';
import { FindCityController } from '@/graphql/controllers/FindCityController';
import { FindAllCitiesController } from '@/graphql/controllers/FindAllCitiesController';
import { DeleteCityController } from '@/graphql/controllers/DeleteCityController';

import { CreateDistrictController } from '@/graphql/controllers/CreateDistrictController';
import { UpdateDistrictController } from '@/graphql/controllers/UpdateDistrictController';
import { FindDistrictController } from '@/graphql/controllers/FindDistrictController';
import { FindAllDistrictsController } from '@/graphql/controllers/FindAllDistrictsController';
import { DeleteDistrictController } from '@/graphql/controllers/DeleteDistrictController';

import { CreateAddressController } from '@/graphql/controllers/CreateAddressController';
import { UpdateAddressController } from '@/graphql/controllers/UpdateAddressController';
import { FindAddressController } from '@/graphql/controllers/FindAddressController';
import { FindAllAddressesController } from '@/graphql/controllers/FindAllAddressesController';
import { DeleteAddressController } from '@/graphql/controllers/DeleteAddressController';

import { CreateCardController } from '@/graphql/controllers/CreateCardController';
import { UpdateCardController } from '@/graphql/controllers/UpdateCardController';
import { AssignPersonCardController } from '@/graphql/controllers/AssignPersonCardController';
import { UnassignPersonCardController } from '@/graphql/controllers/UnassignPersonCardController';
import { UnassignWorkplaceServiceController } from '@/graphql/controllers/UnassignWorkplaceServiceController';
import { FindCardController } from '@/graphql/controllers/FindCardController';
import { FindAllCardsController } from '@/graphql/controllers/FindAllCardsController';
import { DeleteCardController } from '@/graphql/controllers/DeleteCardController';

import { CreatePersonController } from '@/graphql/controllers/CreatePersonController';
import { UpdatePersonController } from '@/graphql/controllers/UpdatePersonController';
import { FindPersonController } from '@/graphql/controllers/FindPersonController';
import { FindAllPeopleController } from '@/graphql/controllers/FindAllPeopleController';
import { DeletePersonController } from '@/graphql/controllers/DeletePersonController';

import { CreateWorkplaceController } from '@/graphql/controllers/CreateWorkplaceController';
import { UpdateWorkplaceController } from '@/graphql/controllers/UpdateWorkplaceController';
import { FindWorkplaceController } from '@/graphql/controllers/FindWorkplaceController';
import { FindAllWorkplacesController } from '@/graphql/controllers/FindAllWorkplacesController';
import { DeleteWorkplaceController } from '@/graphql/controllers/DeleteWorkplaceController';

import { CreateUploadController } from '@/graphql/controllers/CreateUploadController';
import { UpdateUploadController } from '@/graphql/controllers/UpdateUploadController';
import { FindUploadController } from '@/graphql/controllers/FindUploadController';
import { FindAllUploadsController } from '@/graphql/controllers/FindAllUploadsController';
import { DeleteUploadController } from '@/graphql/controllers/DeleteUploadController';

import { CreatePersonCoveringController } from '@/graphql/controllers/CreatePersonCoveringController';
import { UpdatePersonCoveringController } from '@/graphql/controllers/UpdatePersonCoveringController';
import { FindPersonCoveringController } from '@/graphql/controllers/FindPersonCoveringController';
import { FindAllPeopleCoveringController } from '@/graphql/controllers/FindAllPeopleCoveringController';
import { DeletePersonCoveringController } from '@/graphql/controllers/DeletePersonCoveringController';

import { CreatePersonCoverageController } from '@/graphql/controllers/CreatePersonCoverageController';
import { UpdatePersonCoverageController } from '@/graphql/controllers/UpdatePersonCoverageController';
import { FindPersonCoverageController } from '@/graphql/controllers/FindPersonCoverageController';
import { FindAllPeopleCoverageController } from '@/graphql/controllers/FindAllPeopleCoverageController';
import { DeletePersonCoverageController } from '@/graphql/controllers/DeletePersonCoverageController';

import { CreatePostingController } from '@/graphql/controllers/CreatePostingController';
import { UpdatePostingController } from '@/graphql/controllers/UpdatePostingController';
import { FindPostingController } from '@/graphql/controllers/FindPostingController';
import { FindAllPostingsController } from '@/graphql/controllers/FindAllPostingsController';
import { DeletePostingController } from '@/graphql/controllers/DeletePostingController';

const router404Controller = new Router404Controller();

const createCostCenter = new CreateCostCenterController();
const updateCostCenter = new UpdateCostCenterController();
const findCostCenter = new FindCostCenterController();
const findAllCostCenters = new FindAllCostCenterController();
const deleteCostCenter = new DeleteCostCenterController();

const createScale = new CreateScaleController();
const updateScale = new UpdateScaleController();
const findScale = new FindScaleController();
const findAllScales = new findAllScalesController();
const deleteScale = new DeleteScaleController();

const createService = new CreateServiceController();
const updateService = new UpdateServiceController();
const assignPersonService = new AssignPersonServiceController();
const assignWorkplaceService = new AssignWorkplaceServiceController();
const unassignPersonService = new UnassignPersonServiceController();
const unassignWorkplaceService = new UnassignWorkplaceServiceController();
const findService = new FindServiceController();
const findAllServices = new FindAllServicesController();
const deleteService = new DeleteServiceController();

const createReasonForAbsence = new CreateReasonForAbsenceController();
const updateReasonForAbsence = new UpdateReasonForAbsenceController();
const findReasonForAbsence = new FindReasonForAbsenceController();
const findAllReasonForAbsence = new FindAllReasonForAbsenceController();
const DeleteReasonForAbsence = new DeleteReasonForAbsenceController();

const createStreet = new CreateStreetController();
const updateStreet = new UpdateStreetController();
const findStreet = new FindStreetController();
const findAllStreets = new FindAllStreetsController();
const deleteStreet = new DeleteStreetController();

const createNeighborhood = new CreateNeighborhoodController();
const updateNeighborhood = new UpdateNeighborhoodController();
const findNeighborhood = new FindNeighborhoodController();
const findAllNeighborhoods = new FindAllNeighborhoodsController();
const deleteNeighborhood = new DeleteNeighborhoodController();

const createCity = new CreateCityController();
const updateCity = new UpdateCityController();
const findCity = new FindCityController();
const findAllCities = new FindAllCitiesController();
const deleteCity = new DeleteCityController();

const createDistrict = new CreateDistrictController();
const updateDistrict = new UpdateDistrictController();
const findDistrict = new FindDistrictController();
const findAllDistricts = new FindAllDistrictsController();
const deleteDistrict = new DeleteDistrictController();

const createAddress = new CreateAddressController();
const updateAddress = new UpdateAddressController();
const findAddress = new FindAddressController();
const findAllAddresses = new FindAllAddressesController();
const deleteAddress = new DeleteAddressController();

const createCard = new CreateCardController();
const updateCard = new UpdateCardController();
const assignPersonCard = new AssignPersonCardController();
const unassignPersonCard = new UnassignPersonCardController();
const findCard = new FindCardController();
const findAllCards = new FindAllCardsController();
const deleteCard = new DeleteCardController();

const createPerson = new CreatePersonController();
const updatePerson = new UpdatePersonController();
const findPerson = new FindPersonController();
const findAllPerson = new FindAllPeopleController();
const deletePerson = new DeletePersonController();

const createWorkplace = new CreateWorkplaceController();
const updateWorkplace = new UpdateWorkplaceController();
const findWorkplace = new FindWorkplaceController();
const findAllWorkplaces = new FindAllWorkplacesController();
const deleteWorkplace = new DeleteWorkplaceController();

const createUpload = new CreateUploadController();
const updateUpload = new UpdateUploadController();
const findUpload = new FindUploadController();
const findAllUploads = new FindAllUploadsController();
const deleteUpload = new DeleteUploadController();

const createPersonCovering = new CreatePersonCoveringController();
const updatePersonCovering = new UpdatePersonCoveringController();
const findPersonCovering = new FindPersonCoveringController();
const findAllPeopleCovering = new FindAllPeopleCoveringController();
const deletePersonCovering = new DeletePersonCoveringController();

const createPersonCoverage = new CreatePersonCoverageController();
const updatePersonCoverage = new UpdatePersonCoverageController();
const findPersonCoverage = new FindPersonCoverageController();
const findAllPeopleCoverage = new FindAllPeopleCoverageController();
const deletePersonCoverage = new DeletePersonCoverageController();

const createPosting = new CreatePostingController();
const updatePosting = new UpdatePostingController();
const findPosting = new FindPostingController();
const findAllPostings = new FindAllPostingsController();
const deletePosting =new DeletePostingController();

router.post('/costcenter', createCostCenter.handle);
router.put('/costcenter/:id', updateCostCenter.handle);
router.get('/costcenter/:id', findCostCenter.handle);
router.get(['/costcenters', '/costcenters/:limit', '/costcenters/:skip/:limit'], findAllCostCenters.handle);
router.delete('/costcenter/:id', deleteCostCenter.handle);

router.post('/scale', createScale.handle);
router.put('/scale/:id', updateScale.handle);
router.get('/scale/:id', findScale.handle);
router.get(['/scales', '/scales/:limit', '/scales/:skip/:limit'], findAllScales.handle);
router.delete('/scale/:id', deleteScale.handle);

router.post('/service', createService.handle);
router.put('/service/:id', updateService.handle);
router.post('/service/assign/person', assignPersonService.handle);
router.post('/service/assign/workplace', assignWorkplaceService.handle);
router.delete('/service/unassign/person/:id', unassignPersonService.handle);
router.delete('/service/unassign/workplace/:id', unassignWorkplaceService.handle);
router.get('/service/:id', findService.handle);
router.get(['/services', '/services/:limit', '/services/:skip/:limit'], findAllServices.handle);
router.delete('/service/:id', deleteService.handle);

router.post('/reasonforabsence', createReasonForAbsence.handle);
router.put('/reasonforabsence/:id', updateReasonForAbsence.handle);
router.get('/reasonforabsence/:id', findReasonForAbsence.handle);
router.get(['/reasonforabsences', '/reasonforabsences/:limit', '/reasonforabsences/:skip/:limit'], findAllReasonForAbsence.handle);
router.delete('/reasonforabsence/:id', DeleteReasonForAbsence.handle);

router.post('/street', createStreet.handle);
router.put('/street/:id', updateStreet.handle);
router.get('/street/:id', findStreet.handle);
router.get(['/streets', '/streets/:limit', '/streets/:skip/:limit'], findAllStreets.handle);
router.delete('/street/:id', deleteStreet.handle);

router.post('/neighborhood', createNeighborhood.handle);
router.put('/neighborhood/:id', updateNeighborhood.handle);
router.get('/neighborhood/:id', findNeighborhood.handle);
router.get(['/neighborhoods', '/neighborhoods/:limit', '/neighborhoods/:skip/:limit'], findAllNeighborhoods.handle);
router.delete('/neighborhood/:id', deleteNeighborhood.handle);

router.post('/city', createCity.handle);
router.put('/city/:id', updateCity.handle);
router.get('/city/:id', findCity.handle);
router.get(['/cities', '/cities/:limit', '/cities/:skip/:limit'], findAllCities.handle);
router.delete('/city/:id', deleteCity.handle);

router.post('/district', createDistrict.handle);
router.put('/district/:id', updateDistrict.handle);
router.get('/district/:id', findDistrict.handle);
router.get(['/districts', '/districts/:limit', '/districts/:skip/:limit'], findAllDistricts.handle);
router.delete('/district/:id', deleteDistrict.handle);

router.post('/address', createAddress.handle);
router.put('/address/:id', updateAddress.handle);
router.get('/address/:id', findAddress.handle);
router.get(['/addresses', '/addresses/:limit', '/addresses/:skip/:limit'], findAllAddresses.handle);
router.delete('/address/:id', deleteAddress.handle);

router.post('/card', createCard.handle);
router.put('/card/:id', updateCard.handle);
router.put('/card/assign/:id', assignPersonCard.handle);
router.put('/card/unassign/:id', unassignPersonCard.handle);
router.get('/card/:id', findCard.handle);
router.get(['/cards', '/cards/:limit', '/cards/:skip/:limit'], findAllCards.handle);
router.delete('/card/:id', deleteCard.handle);

router.post('/person', createPerson.handle);
router.put('/person/:id', updatePerson.handle);
router.get('/person/:id', findPerson.handle);
router.get(['/people', '/people/:limit', '/people/:skip/:limit'], findAllPerson.handle);
router.delete('/person/:id', deletePerson.handle);

router.post('/workplace', createWorkplace.handle);
router.put('/workplace/:id', updateWorkplace.handle);
router.get('/workplace/:id', findWorkplace.handle);
router.get(['/workplaces', '/workplaces/:limit', '/workplaces/:skip/:limit'], findAllWorkplaces.handle);
router.delete('/workplace/:id', deleteWorkplace.handle);

router.post('/upload', createUpload.handle);
router.put('/upload/:id', updateUpload.handle);
router.get('/upload/:id', findUpload.handle);
router.get(['/uploads', '/uploads/:limit', '/uploads/:skip/:limit'], findAllUploads.handle);
router.delete('/upload/:id', deleteUpload.handle);

router.post('/person_covering', createPersonCovering.handle);
router.put('/person_covering/:id', updatePersonCovering.handle);
router.get('/person_covering/:id', findPersonCovering.handle);
router.get(['/people_covering', '/people_covering/:limit', '/people_covering/:skip/:limit'], findAllPeopleCovering.handle);
router.delete('/person_covering/:id', deletePersonCovering.handle);

router.post('/person_coverage', createPersonCoverage.handle);
router.put('/person_coverage/:id', updatePersonCoverage.handle);
router.get('/person_coverage/:id', findPersonCoverage.handle);
router.get(['/people_coverage', '/people_coverage/:limit', '/people_coverage/:skip/:limit'], findAllPeopleCoverage.handle);
router.delete('/person_coverage/:id', deletePersonCoverage.handle);

router.post('/posting', createPosting.handle);
router.put('/posting/:id', updatePosting.handle);
router.get('/posting/:id', findPosting.handle);
router.get(['/postings', '/postings/:limit', '/postings/:skip/:limit'], findAllPostings.handle);
router.delete('/posting/:id', deletePosting.handle);

router.use(router404Controller.handle);

export { router as routerAPI };