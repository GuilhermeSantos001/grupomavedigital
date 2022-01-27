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
import { findAllScalesController } from '@/graphql/controllers/findAllScalesController';
import { DeleteScaleController } from '@/graphql/controllers/DeleteScaleController';

import { CreateServiceController } from '@/graphql/controllers/CreateServiceController';
import { UpdateServiceController } from '@/graphql/controllers/UpdateServiceController';
import { FindServiceController } from '@/graphql/controllers/FindServiceController';
import { FindAllServicesController } from '@/graphql/controllers/FindAllServicesController';
import {DeleteServiceController} from '@/graphql/controllers/DeleteServiceController';

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
const deleteService =new DeleteServiceController();

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

router.use(router404Controller.handle);

export { router as routerAPI };