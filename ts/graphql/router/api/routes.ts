import { Router } from 'express';

import { Router404Controller } from '@/graphql/controllers/Router404Controller';

import { CreateCostCenterController } from '@/graphql/controllers/CreateCostCenterController';
import { FindCostCenterController } from '@/graphql/controllers/FindCostCenterController';
import { DeleteCostCenterController } from '@/graphql/controllers/DeleteCostCenterController';
import { UpdateCostCenterController } from '@/graphql/controllers/UpdateCostCenterController';

const router = Router({
  strict: true,
  caseSensitive: true
});

const router404Controller = new Router404Controller();

const createCostCenter = new CreateCostCenterController();
const findCostCenter = new FindCostCenterController();
const deleteCostCenter = new DeleteCostCenterController();
const updateCostCenter = new UpdateCostCenterController();

router.post('/costcenter', createCostCenter.handle);
router.get('/costcenter/:id', findCostCenter.handle);
router.delete('/costcenter/:id', deleteCostCenter.handle);
router.put('/costcenter/:id', updateCostCenter.handle);

router.use(router404Controller.handle);

export { router as routerAPI };