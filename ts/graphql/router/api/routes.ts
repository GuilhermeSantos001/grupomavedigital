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
import { findAllScalesController } from '@/app/graphql/controllers/FindAllScalesController';
import { DeleteScaleController } from '@/graphql/controllers/DeleteScaleController';

import { CreateServiceController } from '@/graphql/controllers/CreateServiceController';
import { UpdateServiceController } from '@/graphql/controllers/UpdateServiceController';
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
import {FindNeighborhoodController} from '@/graphql/controllers/FindNeighborhoodController';
import { FindAllNeighborhoodsController } from '@/graphql/controllers/FindAllNeighborhoodsController';
import { DeleteNeighborhoodController } from '@/graphql/controllers/DeleteNeighborhoodController';

import { CreateCityController } from '@/graphql/controllers/CreateCityController';
import {UpdateCityController} from '@/graphql/controllers/UpdateCityController';
import { FindCityController} from '@/graphql/controllers/FindCityController';
import { FindAllCitiesController } from '@/graphql/controllers/FindAllCitiesController';
import { DeleteCityController } from '@/graphql/controllers/DeleteCityController';

import { CreateDistrictController } from '../../controllers/CreateDistrictController';
import { UpdateDistrictController } from '../../controllers/UpdateDistrictController';
import {FindDistrictController} from '../../controllers/FindDistrictController';
import { FindAllDistrictsController } from '../../controllers/FindAllDistrictsController';
import {DeleteDistrictController} from '../../controllers/DeleteDistrictController';

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
const findStreet =new FindStreetController();
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
router.get([ '/cities', '/cities/:limit', '/cities/:skip/:limit'], findAllCities.handle);
router.delete('/city/:id', deleteCity.handle);

router.post('/district', createDistrict.handle);
router.put('/district/:id', updateDistrict.handle);
router.get('/district/:id', findDistrict.handle);
router.get([ '/districts', '/districts/:limit', '/districts/:skip/:limit'], findAllDistricts.handle);
router.delete('/district/:id', deleteDistrict.handle);

router.use(router404Controller.handle);

export { router as routerAPI };